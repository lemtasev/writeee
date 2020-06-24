let actions = [
  {
    'id': 'editor.action.moveCarretLeftAction',
    'alias': 'Move Caret Left',
    'label': 'Move Caret Left',
    'zh': '向左移动插入符号'
  },
  {
    'id': 'editor.action.moveCarretRightAction',
    'alias': 'Move Caret Right',
    'label': 'Move Caret Right',
    'zh': '向右移动插入符号'
  },
  {
    'id': 'editor.action.transposeLetters',
    'alias': 'Transpose Letters',
    'label': 'Transpose Letters',
    'zh': '转置字母'
  },
  {
    'id': 'editor.action.clipboardCutAction',
    'alias': 'Cut',
    'label': 'Cut',
    'zh': '剪切'
  },
  {
    'id': 'editor.action.clipboardCopyAction',
    'alias': 'Copy',
    'label': 'Copy',
    'zh': '复制'
  },
  {
    'id': 'editor.action.clipboardCopyWithSyntaxHighlightingAction',
    'alias': 'Copy With Syntax Highlighting',
    'label': 'Copy With Syntax Highlighting',
    'zh': '使用语法突出显示复制'
  },
  {
    'id': 'editor.action.commentLine',
    'alias': 'Toggle Line Comment',
    'label': 'Toggle Line Comment',
    'zh': '切换线注释'
  },
  {
    'id': 'editor.action.addCommentLine',
    'alias': 'Add Line Comment',
    'label': 'Add Line Comment',
    'zh': '添加行注释'
  },
  {
    'id': 'editor.action.removeCommentLine',
    'alias': 'Remove Line Comment',
    'label': 'Remove Line Comment',
    'zh': '删除行注释'
  },
  {
    'id': 'editor.action.blockComment',
    'alias': 'Toggle Block Comment',
    'label': 'Toggle Block Comment',
    'zh': '切换块注释'
  },
  {
    'id': 'editor.action.showContextMenu',
    'alias': 'Show Editor Context Menu',
    'label': 'Show Editor Context Menu',
    'zh': '显示编辑器上下文菜单'
  },
  {
    'id': 'cursorUndo',
    'alias': 'Cursor Undo',
    'label': 'Cursor Undo',
    'zh': '光标撤销'
  },
  {
    'id': 'cursorRedo',
    'alias': 'Cursor Redo',
    'label': 'Cursor Redo',
    'zh': '游标重做'
  },
  {
    'id': 'editor.action.fontZoomIn',
    'alias': 'Editor Font Zoom In',
    'label': 'Editor Font Zoom In',
    'zh': '编辑器字体放大'
  },
  {
    'id': 'editor.action.fontZoomOut',
    'alias': 'Editor Font Zoom Out',
    'label': 'Editor Font Zoom Out',
    'zh': '编辑器字体缩小'
  },
  {
    'id': 'editor.action.fontZoomReset',
    'alias': 'Editor Font Zoom Reset',
    'label': 'Editor Font Zoom Reset',
    'zh': '编辑器字体缩放重置'
  },
  {
    'id': 'editor.action.copyLinesUpAction',
    'alias': 'Copy Line Up',
    'label': 'Copy Line Up',
    'zh': '向上复制行'
  },
  {
    'id': 'editor.action.copyLinesDownAction',
    'alias': 'Copy Line Down',
    'label': 'Copy Line Down',
    'zh': '向下复制行'
  },
  {
    'id': 'editor.action.duplicateSelection',
    'alias': 'Duplicate Selection',
    'label': 'Duplicate Selection',
    'zh': '重复选择'
  },
  {
    'id': 'editor.action.moveLinesUpAction',
    'alias': 'Move Line Up',
    'label': 'Move Line Up',
    'zh': '向上移动行'
  },
  {
    'id': 'editor.action.moveLinesDownAction',
    'alias': 'Move Line Down',
    'label': 'Move Line Down',
    'zh': '向下移动行'
  },
  {
    'id': 'editor.action.sortLinesAscending',
    'alias': 'Sort Lines Ascending',
    'label': 'Sort Lines Ascending',
    'zh': '升序排列行'
  },
  {
    'id': 'editor.action.sortLinesDescending',
    'alias': 'Sort Lines Descending',
    'label': 'Sort Lines Descending',
    'zh': '降序排列行'
  },
  {
    'id': 'editor.action.trimTrailingWhitespace',
    'alias': 'Trim Trailing Whitespace',
    'label': 'Trim Trailing Whitespace',
    'zh': '修剪尾随空白'
  },
  {
    'id': 'editor.action.deleteLines',
    'alias': 'Delete Line',
    'label': 'Delete Line',
    'zh': '删除行'
  },
  {
    'id': 'editor.action.indentLines',
    'alias': 'Indent Line',
    'label': 'Indent Line',
    'zh': '缩进行'
  },
  {
    'id': 'editor.action.outdentLines',
    'alias': 'Outdent Line',
    'label': 'Outdent Line',
    'zh': '反缩进行'
  },
  {
    'id': 'editor.action.insertLineBefore',
    'alias': 'Insert Line Above',
    'label': 'Insert Line Above',
    'zh': '在上方插入行'
  },
  {
    'id': 'editor.action.insertLineAfter',
    'alias': 'Insert Line Below',
    'label': 'Insert Line Below',
    'zh': '在下面插入行'
  },
  {
    'id': 'deleteAllLeft',
    'alias': 'Delete All Left',
    'label': 'Delete All Left',
    'zh': '删除左边所有内容'
  },
  {
    'id': 'deleteAllRight',
    'alias': 'Delete All Right',
    'label': 'Delete All Right',
    'zh': '删除右边所有内容'
  },
  {
    'id': 'editor.action.joinLines',
    'alias': 'Join Lines',
    'label': 'Join Lines',
    'zh': '连接行（将当前行和下一行合并）'
  },
  {
    'id': 'editor.action.transpose',
    'alias': 'Transpose characters around the cursor',
    'label': 'Transpose characters around the cursor',
    'zh': '在光标周围转置字符'
  },
  {
    'id': 'editor.action.transformToUppercase',
    'alias': 'Transform to Uppercase',
    'label': 'Transform to Uppercase',
    'zh': '转换为大写'
  },
  {
    'id': 'editor.action.transformToLowercase',
    'alias': 'Transform to Lowercase',
    'label': 'Transform to Lowercase',
    'zh': '转换为小写'
  },
  {
    'id': 'editor.action.transformToTitlecase',
    'alias': 'Transform to Title Case',
    'label': 'Transform to Title Case',
    'zh': '转换为标题大小写（每个单词首字母大写，以空格区分）'
  },
  {
    'id': 'editor.action.smartSelect.expand',
    'alias': 'Expand Selection',
    'label': 'Expand Selection',
    'zh': '扩展选择'
  },
  {
    'id': 'editor.action.smartSelect.shrink',
    'alias': 'Shrink Selection',
    'label': 'Shrink Selection',
    'zh': '收缩选择'
  },
  {
    'id': 'editor.action.toggleTabFocusMode',
    'alias': 'Toggle Tab Key Moves Focus',
    'label': 'Toggle Tab Key Moves Focus',
    'zh': '切换选项卡键可移动焦点'
  },
  {
    'id': 'editor.action.forceRetokenize',
    'alias': 'Developer: Force Retokenize',
    'label': 'Developer: Force Retokenize',
    'zh': '开发人员：强制重新标记'
  },
  {
    'id': 'editor.action.toggleHighContrast',
    'alias': 'Toggle High Contrast Theme',
    'label': 'Toggle High Contrast Theme',
    'zh': '切换高对比度主题（黑底白字）'
  },
  {
    'id': 'editor.action.selectToBracket',
    'alias': 'Select to Bracket',
    'label': 'Select to Bracket',
    'zh': '选择括号???'
  },
  {
    'id': 'editor.action.jumpToBracket',
    'alias': 'Go to Bracket',
    'label': 'Go to Bracket',
    'zh': '去支架???'
  },
  {
    'id': 'actions.find',
    'alias': 'Find',
    'label': 'Find',
    'zh': '找'
  },
  {
    'id': 'actions.findWithSelection',
    'alias': 'Find With Selection',
    'label': 'Find With Selection',
    'zh': '查找选择'
  },
  {
    'id': 'editor.action.nextMatchFindAction',
    'alias': 'Find Next',
    'label': 'Find Next',
    'zh': '找下一个'
  },
  {
    'id': 'editor.action.previousMatchFindAction',
    'alias': 'Find Previous',
    'label': 'Find Previous',
    'zh': '查找上一个'
  },
  {
    'id': 'editor.action.nextSelectionMatchFindAction',
    'alias': 'Find Next Selection',
    'label': 'Find Next Selection',
    'zh': '查找下一个选择'
  },
  {
    'id': 'editor.action.previousSelectionMatchFindAction',
    'alias': 'Find Previous Selection',
    'label': 'Find Previous Selection',
    'zh': '查找上一个选择'
  },
  {
    'id': 'editor.action.startFindReplaceAction',
    'alias': 'Replace',
    'label': 'Replace',
    'zh': '更换'
  },
  {
    'id': 'editor.unfold',
    'alias': 'Unfold',
    'label': 'Unfold',
    'zh': '展开'
  },
  {
    'id': 'editor.unfoldRecursively',
    'alias': 'Unfold Recursively',
    'label': 'Unfold Recursively',
    'zh': '递归展开'
  },
  {
    'id': 'editor.fold',
    'alias': 'Fold',
    'label': 'Fold',
    'zh': '折'
  },
  {
    'id': 'editor.foldRecursively',
    'alias': 'Fold Recursively',
    'label': 'Fold Recursively',
    'zh': '递归折叠'
  },
  {
    'id': 'editor.foldAll',
    'alias': 'Fold All',
    'label': 'Fold All',
    'zh': '全部折叠'
  },
  {
    'id': 'editor.unfoldAll',
    'alias': 'Unfold All',
    'label': 'Unfold All',
    'zh': '全部展开'
  },
  {
    'id': 'editor.foldAllBlockComments',
    'alias': 'Fold All Block Comments',
    'label': 'Fold All Block Comments',
    'zh': '折叠所有块注释'
  },
  {
    'id': 'editor.foldAllMarkerRegions',
    'alias': 'Fold All Regions',
    'label': 'Fold All Regions',
    'zh': '折叠所有区域'
  },
  {
    'id': 'editor.unfoldAllMarkerRegions',
    'alias': 'Unfold All Regions',
    'label': 'Unfold All Regions',
    'zh': '展开所有区域'
  },
  {
    'id': 'editor.toggleFold',
    'alias': 'Toggle Fold',
    'label': 'Toggle Fold',
    'zh': '切换折叠'
  },
  {
    'id': 'editor.foldLevel1',
    'alias': 'Fold Level 1',
    'label': 'Fold Level 1',
    'zh': '折叠一级'
  },
  {
    'id': 'editor.foldLevel2',
    'alias': 'Fold Level 2',
    'label': 'Fold Level 2',
    'zh': '折叠等级2'
  },
  {
    'id': 'editor.foldLevel3',
    'alias': 'Fold Level 3',
    'label': 'Fold Level 3',
    'zh': '折叠三级'
  },
  {
    'id': 'editor.foldLevel4',
    'alias': 'Fold Level 4',
    'label': 'Fold Level 4',
    'zh': '折叠4级'
  },
  {
    'id': 'editor.foldLevel5',
    'alias': 'Fold Level 5',
    'label': 'Fold Level 5',
    'zh': '折叠5级'
  },
  {
    'id': 'editor.foldLevel6',
    'alias': 'Fold Level 6',
    'label': 'Fold Level 6',
    'zh': '折叠6级'
  },
  {
    'id': 'editor.foldLevel7',
    'alias': 'Fold Level 7',
    'label': 'Fold Level 7',
    'zh': '折叠等级7'
  },
  {
    'id': 'editor.action.inPlaceReplace.up',
    'alias': 'Replace with Previous Value',
    'label': 'Replace with Previous Value',
    'zh': '替换为先前的值'
  },
  {
    'id': 'editor.action.inPlaceReplace.down',
    'alias': 'Replace with Next Value',
    'label': 'Replace with Next Value',
    'zh': '替换为下一个值'
  },
  {
    'id': 'editor.action.openLink',
    'alias': 'Open Link',
    'label': 'Open Link',
    'zh': '打开链接'
  },
  {
    'id': 'editor.action.insertCursorAbove',
    'alias': 'Add Cursor Above',
    'label': 'Add Cursor Above',
    'zh': '在上方添加光标'
  },
  {
    'id': 'editor.action.insertCursorBelow',
    'alias': 'Add Cursor Below',
    'label': 'Add Cursor Below',
    'zh': '在下方添加光标'
  },
  {
    'id': 'editor.action.insertCursorAtEndOfEachLineSelected',
    'alias': 'Add Cursors to Line Ends',
    'label': 'Add Cursors to Line Ends',
    'zh': '将光标添加到行尾'
  },
  {
    'id': 'editor.action.addSelectionToNextFindMatch',
    'alias': 'Add Selection To Next Find Match',
    'label': 'Add Selection To Next Find Match',
    'zh': '将选择添加到下一个查找匹配项'
  },
  {
    'id': 'editor.action.addSelectionToPreviousFindMatch',
    'alias': 'Add Selection To Previous Find Match',
    'label': 'Add Selection To Previous Find Match',
    'zh': '将选择添加到上一个查找匹配项'
  },
  {
    'id': 'editor.action.moveSelectionToNextFindMatch',
    'alias': 'Move Last Selection To Next Find Match',
    'label': 'Move Last Selection To Next Find Match',
    'zh': '将上一个选择移到下一个查找匹配项'
  },
  {
    'id': 'editor.action.moveSelectionToPreviousFindMatch',
    'alias': 'Move Last Selection To Previous Find Match',
    'label': 'Move Last Selection To Previous Find Match',
    'zh': '将上一个选择移到上一个查找匹配项'
  },
  {
    'id': 'editor.action.selectHighlights',
    'alias': 'Select All Occurrences of Find Match',
    'label': 'Select All Occurrences of Find Match',
    'zh': '选择所有出现的匹配项'
  },
  {
    'id': 'editor.action.addCursorsToBottom',
    'alias': 'Add Cursors To Bottom',
    'label': 'Add Cursors To Bottom',
    'zh': '将光标添加到底部'
  },
  {
    'id': 'editor.action.addCursorsToTop',
    'alias': 'Add Cursors To Top',
    'label': 'Add Cursors To Top',
    'zh': '将光标添加到顶部'
  },
  {
    'id': 'editor.action.wordHighlight.trigger',
    'alias': 'Trigger Symbol Highlight',
    'label': 'Trigger Symbol Highlight',
    'zh': '触发符号高亮'
  },
  {
    'id': 'editor.action.showAccessibilityHelp',
    'alias': 'Show Accessibility Help',
    'label': 'Show Accessibility Help',
    'zh': '显示辅助功能帮助'
  },
  {
    'id': 'editor.action.inspectTokens',
    'alias': 'Developer: Inspect Tokens',
    'label': 'Developer: Inspect Tokens',
    'zh': '开发人员：检查令牌'
  },
  {
    'id': 'editor.action.gotoLine',
    'alias': 'Go to Line...',
    'label': 'Go to Line...',
    'zh': '转到行...'
  },
  {
    'id': 'editor.action.quickCommand',
    'alias': 'Command Palette',
    'label': 'Command Palette',
    'zh': '命令面板'
  },
  {
    'id': 'editor.action.marker.next',
    'alias': 'Go to Next Problem (Error, Warning, Info)',
    'label': 'Go to Next Problem (Error, Warning, Info)',
    'zh': '转到下一个问题（错误，警告，信息）'
  },
  {
    'id': 'editor.action.marker.prev',
    'alias': 'Go to Previous Problem (Error, Warning, Info)',
    'label': 'Go to Previous Problem (Error, Warning, Info)',
    'zh': '转到上一个问题（错误，警告，信息）'
  },
  {
    'id': 'editor.action.marker.nextInFiles',
    'alias': 'Go to Next Problem in Files (Error, Warning, Info)',
    'label': 'Go to Next Problem in Files (Error, Warning, Info)',
    'zh': '转到文件中的下一个问题（错误，警告，信息）'
  },
  {
    'id': 'editor.action.marker.prevInFiles',
    'alias': 'Go to Previous Problem in Files (Error, Warning, Info)',
    'label': 'Go to Previous Problem in Files (Error, Warning, Info)',
    'zh': '转到文件中的上一个问题（错误，警告，信息）'
  },
  {
    'id': 'editor.action.showHover',
    'alias': 'Show Hover',
    'label': 'Show Hover',
    'zh': '显示悬停'
  },
  {
    'id': 'editor.action.showDefinitionPreviewHover',
    'alias': 'Show Definition Preview Hover',
    'label': 'Show Definition Preview Hover',
    'zh': '显示定义预览悬停'
  },
  {
    'id': 'editor.action.triggerSuggest',
    'alias': 'Trigger Suggest',
    'label': 'Trigger Suggest',
    'zh': '触发建议（代码提示）'
  }
]

export default {
  actions: actions
}
