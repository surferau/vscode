/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as assert from 'assert';
import { Range } from 'vs/editor/common/core/range';
import { testViewModel } from 'vs/editor/test/common/viewModel/testViewModel';
import { IEditorOptions } from 'vs/editor/common/config/editorOptions';

suite('ViewModelDecorations', () => {
	test('getDecorationsViewportData', () => {
		const text = [
			'hello world, this is a buffer that will be wrapped'
		];
		const opts: IEditorOptions = {
			wordWrap: 'wordWrapColumn',
			wordWrapColumn: 13
		};
		testViewModel(text, opts, (viewModel, model) => {
			assert.equal(viewModel.getLineContent(1), 'hello world, ');
			assert.equal(viewModel.getLineContent(2), 'this is a ');
			assert.equal(viewModel.getLineContent(3), 'buffer that ');
			assert.equal(viewModel.getLineContent(4), 'will be ');
			assert.equal(viewModel.getLineContent(5), 'wrapped');

			model.changeDecorations((accessor) => {
				let createOpts = (id: string) => {
					return {
						className: id,
						inlineClassName: 'i-' + id,
						beforeContentClassName: 'b-' + id,
						afterContentClassName: 'a-' + id
					};
				};

				// VIEWPORT will be (1,14) -> (1,36)

				// completely before viewport
				accessor.addDecoration(new Range(1, 2, 1, 3), createOpts('dec1'));
				// starts before viewport, ends at viewport start
				accessor.addDecoration(new Range(1, 2, 1, 14), createOpts('dec2'));
				// starts before viewport, ends inside viewport
				accessor.addDecoration(new Range(1, 2, 1, 15), createOpts('dec3'));
				// starts before viewport, ends at viewport end
				accessor.addDecoration(new Range(1, 2, 1, 36), createOpts('dec4'));
				// starts before viewport, ends after viewport
				accessor.addDecoration(new Range(1, 2, 1, 51), createOpts('dec5'));

				// starts at viewport start, ends at viewport start
				accessor.addDecoration(new Range(1, 14, 1, 14), createOpts('dec6'));
				// starts at viewport start, ends inside viewport
				accessor.addDecoration(new Range(1, 14, 1, 16), createOpts('dec7'));
				// starts at viewport start, ends at viewport end
				accessor.addDecoration(new Range(1, 14, 1, 36), createOpts('dec8'));
				// starts at viewport start, ends after viewport
				accessor.addDecoration(new Range(1, 14, 1, 51), createOpts('dec9'));

				// starts inside viewport, ends inside viewport
				accessor.addDecoration(new Range(1, 16, 1, 18), createOpts('dec10'));
				// starts inside viewport, ends at viewport end
				accessor.addDecoration(new Range(1, 16, 1, 36), createOpts('dec11'));
				// starts inside viewport, ends after viewport
				accessor.addDecoration(new Range(1, 16, 1, 51), createOpts('dec12'));

				// starts at viewport end, ends at viewport end
				accessor.addDecoration(new Range(1, 36, 1, 36), createOpts('dec13'));
				// starts at viewport end, ends after viewport
				accessor.addDecoration(new Range(1, 36, 1, 51), createOpts('dec14'));

				// starts after viewport, ends after viewport
				accessor.addDecoration(new Range(1, 40, 1, 51), createOpts('dec15'));
			});

			let actualDecorations = viewModel.getDecorationsInViewport(
				new Range(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3))
			).map((dec) => {
				return dec.options.className;
			});

			assert.deepEqual(actualDecorations, [
				'dec2',
				'dec3',
				'dec4',
				'dec5',
				'dec6',
				'dec7',
				'dec8',
				'dec9',
				'dec10',
				'dec11',
				'dec12',
				'dec13',
				'dec14',
			]);

			let inlineDecorations1 = viewModel.getViewLineRenderingData(
				new Range(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3)),
				2
			).inlineDecorations;

			// view line 2: (1,14 -> 1,24)
			assert.deepEqual(inlineDecorations1, [
				{
					range: new Range(1, 2, 2, 1),
					inlineClassName: 'i-dec2',
					insertsBeforeOrAfter: false
				},
				{
					range: new Range(1, 2, 2, 2),
					inlineClassName: 'i-dec3',
					insertsBeforeOrAfter: false
				},
				{
					range: new Range(2, 1, 2, 2),
					inlineClassName: 'a-dec3',
					insertsBeforeOrAfter: true
				},
				{
					range: new Range(1, 2, 4, 1),
					inlineClassName: 'i-dec4',
					insertsBeforeOrAfter: false
				},
				{
					range: new Range(1, 2, 5, 8),
					inlineClassName: 'i-dec5',
					insertsBeforeOrAfter: false
				},
				{
					range: new Range(2, 1, 2, 1),
					inlineClassName: 'i-dec6',
					insertsBeforeOrAfter: false
				},
				{
					range: new Range(2, 1, 2, 2),
					inlineClassName: 'b-dec6',
					insertsBeforeOrAfter: true
				},
				{
					range: new Range(2, 1, 2, 3),
					inlineClassName: 'i-dec7',
					insertsBeforeOrAfter: false
				},
				{
					range: new Range(2, 1, 2, 2),
					inlineClassName: 'b-dec7',
					insertsBeforeOrAfter: true
				},
				{
					range: new Range(2, 2, 2, 3),
					inlineClassName: 'a-dec7',
					insertsBeforeOrAfter: true
				},
				{
					range: new Range(2, 1, 4, 1),
					inlineClassName: 'i-dec8',
					insertsBeforeOrAfter: false
				},
				{
					range: new Range(2, 1, 2, 2),
					inlineClassName: 'b-dec8',
					insertsBeforeOrAfter: true
				},
				{
					range: new Range(2, 1, 5, 8),
					inlineClassName: 'i-dec9',
					insertsBeforeOrAfter: false
				},
				{
					range: new Range(2, 1, 2, 2),
					inlineClassName: 'b-dec9',
					insertsBeforeOrAfter: true
				},
				{
					range: new Range(2, 3, 2, 5),
					inlineClassName: 'i-dec10',
					insertsBeforeOrAfter: false
				},
				{
					range: new Range(2, 3, 2, 4),
					inlineClassName: 'b-dec10',
					insertsBeforeOrAfter: true
				},
				{
					range: new Range(2, 4, 2, 5),
					inlineClassName: 'a-dec10',
					insertsBeforeOrAfter: true
				},
				{
					range: new Range(2, 3, 4, 1),
					inlineClassName: 'i-dec11',
					insertsBeforeOrAfter: false
				},
				{
					range: new Range(2, 3, 2, 4),
					inlineClassName: 'b-dec11',
					insertsBeforeOrAfter: true
				},
				{
					range: new Range(2, 3, 5, 8),
					inlineClassName: 'i-dec12',
					insertsBeforeOrAfter: false
				},
				{
					range: new Range(2, 3, 2, 4),
					inlineClassName: 'b-dec12',
					insertsBeforeOrAfter: true
				},
			]);

			let inlineDecorations2 = viewModel.getViewLineRenderingData(
				new Range(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3)),
				3
			).inlineDecorations;

			// view line 3 (24 -> 36)
			assert.deepEqual(inlineDecorations2, [
				{
					range: new Range(1, 2, 4, 1),
					inlineClassName: 'i-dec4',
					insertsBeforeOrAfter: false
				},
				{
					range: new Range(1, 2, 5, 8),
					inlineClassName: 'i-dec5',
					insertsBeforeOrAfter: false
				},
				{
					range: new Range(2, 1, 4, 1),
					inlineClassName: 'i-dec8',
					insertsBeforeOrAfter: false
				},
				{
					range: new Range(2, 1, 5, 8),
					inlineClassName: 'i-dec9',
					insertsBeforeOrAfter: false
				},
				{
					range: new Range(2, 3, 4, 1),
					inlineClassName: 'i-dec11',
					insertsBeforeOrAfter: false
				},
				{
					range: new Range(2, 3, 5, 8),
					inlineClassName: 'i-dec12',
					insertsBeforeOrAfter: false
				},
			]);
		});
	});

	test('issue #17208: Problem scrolling in 1.8.0', () => {
		const text = [
			'hello world, this is a buffer that will be wrapped'
		];
		const opts: IEditorOptions = {
			wordWrap: 'wordWrapColumn',
			wordWrapColumn: 13
		};
		testViewModel(text, opts, (viewModel, model) => {
			assert.equal(viewModel.getLineContent(1), 'hello world, ');
			assert.equal(viewModel.getLineContent(2), 'this is a ');
			assert.equal(viewModel.getLineContent(3), 'buffer that ');
			assert.equal(viewModel.getLineContent(4), 'will be ');
			assert.equal(viewModel.getLineContent(5), 'wrapped');

			model.changeDecorations((accessor) => {
				accessor.addDecoration(
					new Range(1, 50, 1, 51),
					{
						beforeContentClassName: 'dec1'
					}
				);
			});

			let decorations = viewModel.getDecorationsInViewport(
				new Range(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3))
			);
			assert.deepEqual(decorations, []);

			let inlineDecorations1 = viewModel.getViewLineRenderingData(
				new Range(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3)),
				2
			).inlineDecorations;
			assert.deepEqual(inlineDecorations1, []);

			let inlineDecorations2 = viewModel.getViewLineRenderingData(
				new Range(2, viewModel.getLineMinColumn(2), 3, viewModel.getLineMaxColumn(3)),
				3
			).inlineDecorations;
			assert.deepEqual(inlineDecorations2, []);
		});
	});
});
