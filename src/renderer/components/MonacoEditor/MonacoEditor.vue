<template>
    <div class="editor-box" v-show="showEdit">

        <div v-show="!searchMode" class="title-box">
            <input class="title-ipt"
                   v-model="item.title" @blur="renameFile" @change="docModified(true)"></input>
        </div>

        <div class="content-box">
            <div ref="monacoContainer" class="content-ipt"></div>
        </div>

        <div v-show="!searchMode" class="info-box">
            <div class="info-box-l">
                <span>{{content ? content.length : 0}}/3000</span>
            </div>
            <div class="info-box-m">
                <span>{{$moment(item.createTime).format('YYYY-MM-DD HH:mm:ss') || ''}}</span>
            </div>
            <div class="info-box-r">
                <span>
                    <span>段落</span>
                    <input type="checkbox" v-model="userSetting.editor.lineNumbers" @change="setLineNumberOnOff"></input>
                </span>
                <span>
                    <span>预览</span>
                    <input type="checkbox" v-model="userSetting.editor.minimap" @change="setMiniMapOnOff"></input>
                </span>
                <span>{{item.modified ? '已修改' : ''}}</span>
                <span>{{cursorPosition.lineNumber}}:{{cursorPosition.column}}</span>
                <span><el-button size="mini" @click="saveContent">save</el-button></span>
            </div>
        </div>

    </div>
</template>

<script>
  // 显示指定行列： editor_api.revealPositionInCenter({ lineNumber: 1, column: 1 })
  // 选中指定行列： editor_api.setSelection({ startLineNumber:1, startColumn:1, endLineNumber: 1, endColumn: 1 })

  // ==========token class==========
  // identifier         entity           constructor
  // operators          tag              namespace
  // keyword            info-token       type
  // string             warn-token       predefined
  // string.escape      error-token      invalid
  // comment            debug-token
  // comment.doc        regexp
  // constant           attribute
  //
  // delimiter .[curly,square,parenthesis,angle,array,bracket]
  // number    .[hex,octal,binary,float]
  // variable  .[name,value]
  // meta      .[content]
  // ==========token class==========
  // require.config({ paths: { 'vs': 'monaco-editor/vs' } })
  // require.config({ 'vs/nls': { availableLanguages: { '*': 'zh-cn' } } })
  // require.config({paths: { 'vs': '../../../../node_modules/monaco-editor/min/vs' }})
  // require.config({'vs/nls': {availableLanguages: {'*': 'zh-cn'}}})

  import fileService from '@/service/FileService'
  // import systemService from '@/service/SystemService'
  import * as monaco from 'monaco-editor'
  import defaultSetting from '@/defaultSetting'
  // import merge from 'merge'

  export default {
    name: 'MonacoEditor',
    // components: {MonacoEditor},
    props: {
      home: {
        type: Object,
        default: {}
      },
      item: {
        type: Object,
        default: {}
      },
      searchMode: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        langName: 'wtee',
        monacoEditor: null,
        userSetting: defaultSetting,

        content: '',
        showEdit: false,
        hints: [
          {
            label: '欧阳锋', // 显示的提示名称
            insertText: '欧阳锋', // 此项没有的话，默认是label值
            kind: monaco.languages.CompletionItemKind.Function // 这里Function也可以是别的值，主要用来显示不同的图标
            // detail: '' // 提示内容后的说明
            // documentation: '' // 点感叹号显示的详细说明
          },
          {
            label: '赵四',
            insertText: '赵四',
            kind: monaco.languages.CompletionItemKind.Text
          },
          {
            label: '赵敏',
            insertText: '赵敏',
            kind: monaco.languages.CompletionItemKind.Keyword
          },
          {
            label: '张翠山',
            insertText: '张翠山',
            kind: monaco.languages.CompletionItemKind.Snippet
          },
          {
            label: '张无忌',
            insertText: '张无忌',
            kind: monaco.languages.CompletionItemKind.Function
          },
          {
            label: '张三丰',
            insertText: '张三丰',
            kind: monaco.languages.CompletionItemKind.Function
          }
        ],
        cursorPosition: {
          column: 1,
          lineNumber: 1
        },
        modelSelection: {}, // 'path': 'Selection' 记录当前打开文件的光标选中位置，或许可以持久化到磁盘
        viewState: {} // 'path': 'Selection' 记录当前打开文件的光标选中位置，或许可以持久化到磁盘
      }
    },
    watch: {
      item: {
        immediate: true,
        handler: function (v, ov) {
          console.log('item', v, ov)
          if (this.monacoEditor) {
            this.monacoEditor.focus()
          }
          if (v.path === 'Welcome') {
            console.log('Welcome 不读')
            return
          }
          if (ov && v.path === ov.path) {
            console.log('同一文件，不重复读')
            this.setRevealRange(v.range)
            return
          }
          this.showEdit = false
          this.content = ''
          if (!v.path) return
          if (v.fileType !== fileService.fileTypeEnum.DIR) {
            if (v.blksize > 5 * 1024 * 1024) {
              console.error('文件过大，无法打开！')
              return
            }
            if (ov && ov.path) this.viewState[ov.path] = this.monacoEditor.saveViewState() // 保存viewState
            this.readFile(v)
          }
        }
      }
      // hints (v, ov) {
      //   // 当提示项非空时，触发提示，能够使提示项更新并显示
      //   if (v.length > 0) {
      //     this.monacoEditor.trigger('提示', 'editor.action.triggerSuggest', {})
      //   }
      // }
    },
    mounted () {
      console.log(`${this.$options.name} mounted`)
      this.initMonaco()
    },
    methods: {
      async initMonaco () {
        let userSetting = this.$electron.remote.getGlobal('sharedObject').userSetting
        // if (!userSetting) {
        //   let ret = await systemService.findUserSetting('userSetting')
        //   if (ret && ret.length > 0) {
        //     userSetting = ret[0].value
        //   }
        //   userSetting = merge(defaultSetting, userSetting)
        //   console.log('userSetting', userSetting)
        //   this.$electron.remote.getGlobal('sharedObject').userSetting = userSetting
        // }
        this.userSetting = userSetting
        let that = this
        let langName = this.langName
        // ==========初始化wtee主题==========
        monaco.editor.defineTheme(langName, {
          base: 'vs',
          inherit: true,
          rules: [
            {token: 'custom-number', foreground: '#b7b3f2', fontStyle: 'bold'},
            {token: 'custom-zh', foreground: '#808080'},
            {token: 'custom-en', foreground: '#2299ff'}
          ]
        })
        monaco.languages.register({id: langName})
        monaco.languages.setMonarchTokensProvider(langName, {
          tokenizer: {
            root: [
              [/\d+/, {token: 'custom-number'}], // 数字
              [/[a-zA-Z]+/, {token: 'custom-en'}], // 英文
              [/[\u4e00-\u9fa5]+/, {token: 'custom-zh'}] // 中文
            ]
          }
        })
        monaco.languages.registerCompletionItemProvider(langName, {
          provideCompletionItems (model, position) {
            return {
              suggestions: that.hints
            }
          }
        })
        // monaco.languages.registerHoverProvider(langName, {
        //   provideHover: function (model, position, token) {
        //     return Promise.resolve({
        //       contents: [ { value: 'hello world' } ],
        //       range: { startLineNumber: 5, startColumn: 1, endLineNumber: 5, endColumn: 1 }
        //     })
        //   }
        // })
        // monaco.languages.registerDefinitionProvider(langName, {
        //   provideDefinition: function (model, position, token) {
        //     return Promise.resolve([{
        //       uri: monaco.Uri.parse('http://host/to_file_name'),
        //       range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 }
        //     }])
        //   }
        // })
        // ==========初始化wtee主题==========
        this.monacoEditor = monaco.editor.create(this.$refs.monacoContainer, {
          // value: this.content,
          language: langName,
          // language: 'text/plain',
          theme: this.userSetting.general.darkTheme ? 'vs-dark' : langName, // 编辑器主题：vs, hc-black, or vs-dark
          wordWrap: this.userSetting.editor.wordWrap ? 'on' : 'off', // 自动换行
          lineNumbers: this.userSetting.editor.lineNumbers ? 'on' : 'off', // 显示行号
          quickSuggestions: false, // 默认的提示
          automaticLayout: true, // 自动布局
          fontSize: this.userSetting.editor.fontSize,
          lineHeight: this.userSetting.editor.lineHeight,
          fontFamily: this.userSetting.editor.fontFamily,
          contextmenu: false, // 禁用默认右键菜单
          scrollBeyondLastLine: false // 启用滚动可以在最后一行之后移动一个屏幕大小。默认为true。
        })
        this.monacoEditor.onDidChangeModelContent(e => {
          // console.log('onDidChangeModelContent', e)
          this.content = this.monacoEditor.getValue()
          this.docModified(true)
        })
        this.monacoEditor.onDidChangeModel(e => {
          // console.log('onDidChangeModel', e)
          // this.cursorPosition = {column: 1, lineNumber: 1}
          // if (this.viewState[this.item.path]) {
          //   this.monacoEditor.restoreViewState(this.viewState[this.item.path])
          //   this.cursorPosition = this.viewState[this.item.path].cursorState[0].position
          // }
        })
        this.monacoEditor.onDidBlurEditorText(_ => {
          // console.log('onDidBlurEditorText')
          // this.saveContent()
        })
        this.monacoEditor.onDidChangeCursorPosition(e => {
          // console.log('onDidChangeCursorPosition', e)
          this.cursorPosition = e.position
        })
        this.monacoEditor.onDidChangeCursorSelection(e => {
          // console.log('onDidChangeCursorSelection', e)
        })
        this.monacoEditor.onDidScrollChange(e => {
          // console.log('onDidScrollChange', e)
        })
        this.monacoEditor.onContextMenu((e) => {
          // console.log('onContextMenu', e)
          let userFolderContextMenuJson = [
            {
              label: '撤销',
              // role: 'undo',
              click: () => {
                this.monacoEditor.getModel().undo()
              }
            },
            {
              label: '恢复',
              // role: 'redo',
              click: () => {
                this.monacoEditor.getModel().redo()
              }
            },
            {type: 'separator'},
            {label: '剪切', role: 'cut'},
            {label: '复制', role: 'copy'},
            {label: '粘贴', role: 'paste'},
            {
              label: '全选',
              // role: 'selectAll',
              click: () => {
                const range = this.monacoEditor.getModel().getFullModelRange()
                this.monacoEditor.setSelection(range)
              }
            }
          ]
          let contextMenu = this.$electron.remote.Menu.buildFromTemplate(userFolderContextMenuJson)
          contextMenu.popup({window: this.$electron.remote.getCurrentWindow()})
        })
        // ==========注册快捷键==========
        this.monacoEditor.addCommand(monaco.KeyMod.WinCtrl | monaco.KeyCode.US_SLASH, function () {
          console.log('提示：WinCtrl + ?')
          that.monacoEditor.trigger('提示', 'editor.action.triggerSuggest', {})
        })
        this.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function () {
          console.log('快捷键保存当前文件')
          that.saveContent()
        })
        // ==========注册快捷键==========
      },
      closeFileWithoutSave (wteeFile) {
        console.log('关闭不保存文件', wteeFile)
        let uri = monaco.Uri.parse('file://' + wteeFile.path)
        let model = monaco.editor.getModel(uri) // 如果该文档已经创建，打开则直接取得已存在的model
        model.dispose()
        wteeFile.modified = false
      },
      closeFileWithSave (wteeFile) {
        console.log('关闭并保存文件', wteeFile)
        let uri = monaco.Uri.parse('file://' + wteeFile.path)
        let model = monaco.editor.getModel(uri) // 如果该文档已经创建，打开则直接取得已存在的model
        let value = model.getValue()
        this.$set(wteeFile, 'loading', true)
        fileService.saveFile(wteeFile, value).then(_ => {
          this.$set(wteeFile, 'loading', false)
        })
        model.dispose() // 此处也许可以继续保留
        wteeFile.modified = false
      },
      docModified (modified) {
        console.log('docModified')
        this.home.docModified(this.item, modified)
      },
      renameFile () {
        if (!this.item.modified) return
        this.docModified(false)
        this.$set(this.item, 'loading', true)
        fileService.renameFile(this.item).then(_ => {
          this.$set(this.item, 'loading', false)
        })
      },
      readFile (wteeFile) {
        console.log('开始读')
        // ==========model==========
        let t1 = new Date().getTime()
        let uri = monaco.Uri.parse('file://' + wteeFile.path)
        let model = monaco.editor.getModel(uri) // 如果该文档已经创建，打开则直接取得已存在的model
        if (!model) {
          // 否则创建新的model
          // this.$set(this.item, 'loading', true)
          let ret = fileService.readFileSync(wteeFile.path)
          // this.$set(this.item, 'loading', false)
          model = monaco.editor.createModel(ret, this.langName, uri)
        }
        let t2 = new Date().getTime()
        console.log('读【' + wteeFile.title + '】耗时', (t2 - t1))
        this.content = model.getValue()
        this.showEdit = true
        this.monacoEditor.setModel(model)

        this.cursorPosition = {column: 1, lineNumber: 1}
        if (this.viewState[this.item.path]) {
          this.monacoEditor.restoreViewState(this.viewState[this.item.path]) // 恢复viewState
          this.cursorPosition = this.viewState[this.item.path].cursorState[0].position
        }

        this.setRevealRange(wteeFile.range)
        // ==========model==========
      },
      // 检查是否有选中范围
      setRevealRange (range) {
        if (range) {
          setTimeout(() => {
            console.log('跳转到指定位置', range)
            this.monacoEditor.revealRangeInCenter(range)
            // 设置高亮
            this.monacoEditor.setSelection(range)
            this.monacoEditor.trigger('', 'actions.find')
          }, 0)
        }
      },
      saveContent () {
        if (!this.item.modified) {
          console.log('没什么好保存的')
          return
        }
        this.docModified(false)
        console.log(this.item)
        this.$set(this.item, 'loading', true)
        fileService.saveFile(this.item, this.content).then(_ => {
          this.$set(this.item, 'loading', false)
        })
      },
      // 切换显示行号
      setLineNumberOnOff () {
        this.monacoEditor.updateOptions({lineNumbers: this.userSetting.editor.lineNumbers ? 'on' : 'off'})
      },
      // 切换显示小地图
      setMiniMapOnOff () {
        this.monacoEditor.updateOptions({minimap: {enabled: this.userSetting.editor.minimap}})
      },
      // 获取model实例
      getModel (editor) {
        return editor.getModel()
      },
      // 获取代码内容（字符串）
      getCode (editor) {
        return editor.getModel().getValue()
      },
      // 获取代码长度
      getCodeLength (editor) {
        return editor.getModel().getValueLength()
      },
      // 获取光标位置
      getCursorPosition (editor) {
        let line = editor.getPosition().lineNumber
        let column = editor.getPosition().column
        return {ln: line, col: column}
      },
      // 跳光标到给定位置
      setCursorPosition (editor, ln, col) {
        let pos = {lineNumber: ln, column: col}
        editor.setPosition(pos)
      },
      // 置焦点到某编辑器
      setFocus (editor) {
        editor.focus()
      },
      // 字号
      setFontSize (editor, size) {
        editor.updateOptions({fontSize: size})
      },
      // 字体
      setFontFamily (editor, family) {
        editor.updateOptions({fontFamily: family})
      },
      layoutMonaco () {
        if (this.monacoEditor) this.monacoEditor.layout()
      }
    }
  }
</script>

<style lang="less" scoped>

    @import '../../common.less';

    .editor-box {
        width: 100%;
        height: 100%;
        background-color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .title-box {
            width: calc(100% - 40px);
            height: 69px;
            padding: 0 20px;
            border-bottom: 1px solid @colorBorder;
            display: flex;
            align-items: center;
            .title-ipt {
                width: 100%;
                border: none;
                outline: none;
                font-size: @fontSizeBig;
            }
        }
        .content-box {
            width: 100%;
            height: calc(100% - 100px);
            background-color: #eee;
            .content-ipt {
                width: 100%;
                height: 100%;
            }
        }
        .info-box {
            width: calc(100% - 40px);
            height: 29px;
            padding: 0 20px;
            border-top: 1px solid @colorBorder;
            display: flex;
            font-size: @fontSizeTiny;
            color: @wxColorGray;
            align-items: center;
            justify-content: space-between;
            .info-box-l {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .info-box-m {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .info-box-r {
                display: flex;
                align-items: center;
                justify-content: center;
                span {
                    margin: 0 5px;
                }
            }
        }

    }

</style>
<!--A list of color names:-->
<!--'foreground' // Overall foreground color. This color is only used if not overridden by a component.-->
<!--'errorForeground' // Overall foreground color for error messages. This color is only used if not overridden by a component.-->
<!--'descriptionForeground' // Foreground color for description text providing additional information, for example for a label.-->
<!--'focusBorder' // Overall border color for focused elements. This color is only used if not overridden by a component.-->
<!--'contrastBorder' // An extra border around elements to separate them from others for greater contrast.-->
<!--'contrastActiveBorder' // An extra border around active elements to separate them from others for greater contrast.-->
<!--'selection.background' // The background color of text selections in the workbench (e.g. for input fields or text areas). Note that this does not apply to selections within the editor.-->
<!--'textSeparator.foreground' // Color for text separators.-->
<!--'textLink.foreground' // Foreground color for links in text.-->
<!--'textLink.activeForeground' // Foreground color for active links in text.-->
<!--'textPreformat.foreground' // Foreground color for preformatted text segments.-->
<!--'textBlockQuote.background' // Background color for block quotes in text.-->
<!--'textBlockQuote.border' // Border color for block quotes in text.-->
<!--'textCodeBlock.background' // Background color for code blocks in text.-->
<!--'widget.shadow' // Shadow color of widgets such as find/replace inside the editor.-->
<!--'input.background' // Input box background.-->
<!--'input.foreground' // Input box foreground.-->
<!--'input.border' // Input box border.-->
<!--'inputOption.activeBorder' // Border color of activated options in input fields.-->
<!--'input.placeholderForeground' // Input box foreground color for placeholder text.-->
<!--'inputValidation.infoBackground' // Input validation background color for information severity.-->
<!--'inputValidation.infoBorder' // Input validation border color for information severity.-->
<!--'inputValidation.warningBackground' // Input validation background color for information warning.-->
<!--'inputValidation.warningBorder' // Input validation border color for warning severity.-->
<!--'inputValidation.errorBackground' // Input validation background color for error severity.-->
<!--'inputValidation.errorBorder' // Input validation border color for error severity.-->
<!--'dropdown.background' // Dropdown background.-->
<!--'dropdown.foreground' // Dropdown foreground.-->
<!--'dropdown.border' // Dropdown border.-->
<!--'list.focusBackground' // List/Tree background color for the focused item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not.-->
<!--'list.focusForeground' // List/Tree foreground color for the focused item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not.-->
<!--'list.activeSelectionBackground' // List/Tree background color for the selected item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not.-->
<!--'list.activeSelectionForeground' // List/Tree foreground color for the selected item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not.-->
<!--'list.inactiveSelectionBackground' // List/Tree background color for the selected item when the list/tree is inactive. An active list/tree has keyboard focus, an inactive does not.-->
<!--'list.inactiveSelectionForeground' // List/Tree foreground color for the selected item when the list/tree is inactive. An active list/tree has keyboard focus, an inactive does not.-->
<!--'list.hoverBackground' // List/Tree background when hovering over items using the mouse.-->
<!--'list.hoverForeground' // List/Tree foreground when hovering over items using the mouse.-->
<!--'list.dropBackground' // List/Tree drag and drop background when moving items around using the mouse.-->
<!--'list.highlightForeground' // List/Tree foreground color of the match highlights when searching inside the list/tree.-->
<!--'pickerGroup.foreground' // Quick picker color for grouping labels.-->
<!--'pickerGroup.border' // Quick picker color for grouping borders.-->
<!--'button.foreground' // Button foreground color.-->
<!--'button.background' // Button background color.-->
<!--'button.hoverBackground' // Button background color when hovering.-->
<!--'badge.background' // Badge background color. Badges are small information labels, e.g. for search results count.-->
<!--'badge.foreground' // Badge foreground color. Badges are small information labels, e.g. for search results count.-->
<!--'scrollbar.shadow' // Scrollbar shadow to indicate that the view is scrolled.-->
<!--'scrollbarSlider.background' // Slider background color.-->
<!--'scrollbarSlider.hoverBackground' // Slider background color when hovering.-->
<!--'scrollbarSlider.activeBackground' // Slider background color when active.-->
<!--'progressBar.background' // Background color of the progress bar that can show for long running operations.-->
<!--'editor.background' // Editor background color.-->
<!--'editor.foreground' // Editor default foreground color.-->
<!--'editorWidget.background' // Background color of editor widgets, such as find/replace.-->
<!--'editorWidget.border' // Border color of editor widgets. The color is only used if the widget chooses to have a border and if the color is not overridden by a widget.-->
<!--'editor.selectionBackground' // Color of the editor selection.-->
<!--'editor.selectionForeground' // Color of the selected text for high contrast.-->
<!--'editor.inactiveSelectionBackground' // Color of the selection in an inactive editor.-->
<!--'editor.selectionHighlightBackground' // Color for regions with the same content as the selection.-->
<!--'editor.findMatchBackground' // Color of the current search match.-->
<!--'editor.findMatchHighlightBackground' // Color of the other search matches.-->
<!--'editor.findRangeHighlightBackground' // Color the range limiting the search.-->
<!--'editor.hoverHighlightBackground' // Highlight below the word for which a hover is shown.-->
<!--'editorHoverWidget.background' // Background color of the editor hover.-->
<!--'editorHoverWidget.border' // Border color of the editor hover.-->
<!--'editorLink.activeForeground' // Color of active links.-->
<!--'diffEditor.insertedTextBackground' // Background color for text that got inserted.-->
<!--'diffEditor.removedTextBackground' // Background color for text that got removed.-->
<!--'diffEditor.insertedTextBorder' // Outline color for the text that got inserted.-->
<!--'diffEditor.removedTextBorder' // Outline color for text that got removed.-->
<!--'merge.currentHeaderBackground' // Current header background in inline merge-conflicts.-->
<!--'merge.currentContentBackground' // Current content background in inline merge-conflicts.-->
<!--'merge.incomingHeaderBackground' // Incoming header background in inline merge-conflicts.-->
<!--'merge.incomingContentBackground' // Incoming content background in inline merge-conflicts.-->
<!--'merge.commonHeaderBackground' // Common ancestor header background in inline merge-conflicts.-->
<!--'merge.commonContentBackground' // Common ancester content background in inline merge-conflicts.-->
<!--'merge.border' // Border color on headers and the splitter in inline merge-conflicts.-->
<!--'editorOverviewRuler.currentContentForeground' // Current overview ruler foreground for inline merge-conflicts.-->
<!--'editorOverviewRuler.incomingContentForeground' // Incoming overview ruler foreground for inline merge-conflicts.-->
<!--'editorOverviewRuler.commonContentForeground' // Common ancestor overview ruler foreground for inline merge-conflicts.-->
<!--'editor.lineHighlightBackground' // Background color for the highlight of line at the cursor position.-->
<!--'editor.lineHighlightBorder' // Background color for the border around the line at the cursor position.-->
<!--'editor.rangeHighlightBackground' // Background color of highlighted ranges, like by quick open and find features.-->
<!--'editorCursor.foreground' // Color of the editor cursor.-->
<!--'editorWhitespace.foreground' // Color of whitespace characters in the editor.-->
<!--'editorIndentGuide.background' // Color of the editor indentation guides.-->
<!--'editorLineNumber.foreground' // Color of editor line numbers.-->
<!--'editorRuler.foreground' // Color of the editor rulers.-->
<!--'editorCodeLens.foreground' // Foreground color of editor code lenses-->
<!--'editorBracketMatch.background' // Background color behind matching brackets-->
<!--'editorBracketMatch.border' // Color for matching brackets boxes-->
<!--'editorOverviewRuler.border' // Color of the overview ruler border.-->
<!--'editorGutter.background' // Background color of the editor gutter. The gutter contains the glyph margins and the line numbers.-->
<!--'editorError.foreground' // Foreground color of error squigglies in the editor.-->
<!--'editorError.border' // Border color of error squigglies in the editor.-->
<!--'editorWarning.foreground' // Foreground color of warning squigglies in the editor.-->
<!--'editorWarning.border' // Border color of warning squigglies in the editor.-->
<!--'editorMarkerNavigationError.background' // Editor marker navigation widget error color.-->
<!--'editorMarkerNavigationWarning.background' // Editor marker navigation widget warning color.-->
<!--'editorMarkerNavigation.background' // Editor marker navigation widget background.-->
<!--'editorSuggestWidget.background' // Background color of the suggest widget.-->
<!--'editorSuggestWidget.border' // Border color of the suggest widget.-->
<!--'editorSuggestWidget.foreground' // Foreground color of the suggest widget.-->
<!--'editorSuggestWidget.selectedBackground' // Background color of the selected entry in the suggest widget.-->
<!--'editorSuggestWidget.highlightForeground' // Color of the match highlights in the suggest widget.-->
<!--'editor.wordHighlightBackground' // Background color of a symbol during read-access, like reading a variable.-->
<!--'editor.wordHighlightStrongBackground' // Background color of a symbol during write-access, like writing to a variable.-->
<!--'peekViewTitle.background' // Background color of the peek view title area.-->
<!--'peekViewTitleLabel.foreground' // Color of the peek view title.-->
<!--'peekViewTitleDescription.foreground' // Color of the peek view title info.-->
<!--'peekView.border' // Color of the peek view borders and arrow.-->
<!--'peekViewResult.background' // Background color of the peek view result list.-->
<!--'peekViewResult.lineForeground' // Foreground color for line nodes in the peek view result list.-->
<!--'peekViewResult.fileForeground' // Foreground color for file nodes in the peek view result list.-->
<!--'peekViewResult.selectionBackground' // Background color of the selected entry in the peek view result list.-->
<!--'peekViewResult.selectionForeground' // Foreground color of the selected entry in the peek view result list.-->
<!--'peekViewEditor.background' // Background color of the peek view editor.-->
<!--'peekViewEditorGutter.background' // Background color of the gutter in the peek view editor.-->
<!--'peekViewResult.matchHighlightBackground' // Match highlight color in the peek view result list.-->
<!--'peekViewEditor.matchHighlightBackground' // Match highlight color in the peek view editor.-->
