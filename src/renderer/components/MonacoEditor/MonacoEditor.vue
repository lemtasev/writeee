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
                    <input type="checkbox" v-model="editorOptions.lineNumbers" @change="setLineNumberOnOff"></input>
                </span>
                <span>
                    <span>预览</span>
                    <input type="checkbox" v-model="editorOptions.minimap" @change="setMiniMapOnOff"></input>
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
  // require.config({ paths: { 'vs': '../node_modules/monaco-editor/min/vs' }});
  // require.config({
  //   'vs/nls' : {
  //     availableLanguages: {
  //       '*': 'zh-cn'
  //     }
  //   }
  // });

  import fileService from '@/service/FileService'
  import * as monaco from 'monaco-editor'

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
        editorOptions: {
          lineNumbers: true,
          minimap: true
        },

        content: '',
        showEdit: false,
        hints: [
          {
            label: 'AaaBbb', // 显示的提示名称
            insertText: 'AaaBbb',
            kind: monaco.languages.CompletionItemKind.Function // 这里Function也可以是别的值，主要用来显示不同的图标
            // 此项没有的话，默认是label值
            // detail: '' // 提示内容后的说明
            // documentation: '' // 点感叹号显示的详细说明
          },
          {
            label: 'AAA',
            insertText: 'AAA',
            kind: monaco.languages.CompletionItemKind.Text
          },
          {
            label: 'BBB',
            insertText: 'BBB',
            kind: monaco.languages.CompletionItemKind.Keyword
          },
          {
            label: '111',
            insertText: '111',
            kind: monaco.languages.CompletionItemKind.Snippet
          },
          {
            label: '222',
            insertText: '222',
            kind: monaco.languages.CompletionItemKind.Function
          },
          {
            label: '张三丰',
            insertText: '张三丰',
            kind: monaco.languages.CompletionItemKind.Function
          }
        ],
        cursorPosition: {
          column: 0,
          lineNumber: 0
        },
        modelSelection: {} // 'path': 'Selection' 记录当前打开文件的光标选中位置，或许可以持久化到磁盘
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
      console.log('mounted')
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
      // ==========初始化wtee主题==========
      this.monacoEditor = monaco.editor.create(this.$refs.monacoContainer, {
        // value: this.content,
        language: langName,
        theme: langName, // 编辑器主题：vs, hc-black, or vs-dark
        wordWrap: 'on', // 自动换行
        lineNumbers: 'on', // 显示行号
        quickSuggestions: false, // 默认的提示
        automaticLayout: true, // 自动布局
        lineHeight: 24,
        // hideCursorInOverviewRuler: true, // 光标是否隐藏在概览标尺中。默认为false。
        // overviewRulerBorder: false, // 控制是否应围绕总览标尺绘制边框。默认为true。
        fontFamily: 'Microsoft YaHei',
        scrollBeyondLastLine: false // 启用滚动可以在最后一行之后移动一个屏幕大小。默认为true。
      })
      this.monacoEditor.onDidChangeModelContent(e => {
        console.log('onDidChangeModelContent', e)
        this.content = this.monacoEditor.getValue()
        this.docModified(true)
      })
      this.monacoEditor.onDidChangeModel(e => {
        console.log('onDidChangeModel', e)
        if (this.modelSelection[this.item.path]) this.monacoEditor.setSelection(this.modelSelection[this.item.path])
      })
      this.monacoEditor.onDidBlurEditorText(_ => {
        console.log('onDidBlurEditorText')
        // this.saveContent()
      })
      this.monacoEditor.onDidChangeCursorPosition(e => {
        console.log('onDidChangeCursorPosition', e)
        this.cursorPosition = e.position
      })
      this.monacoEditor.onDidChangeCursorSelection(e => {
        console.log('onDidChangeCursorSelection', e)
        this.modelSelection[this.item.path] = e.selection
      })
      this.monacoEditor.addCommand(monaco.KeyMod.WinCtrl | monaco.KeyCode.US_SLASH, function () {
        that.monacoEditor.trigger('提示', 'editor.action.triggerSuggest', {})
      })
      this.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function () {
        console.log('快捷键保存当前文件')
        that.saveContent()
      })
    },
    methods: {
      closeFileWithoutSave (weeFile) {
        console.log('关闭不保存文件', weeFile)
        let uri = monaco.Uri.parse('file://' + weeFile.path)
        let model = monaco.editor.getModel(uri) // 如果该文档已经创建，打开则直接取得已存在的model
        model.dispose()
        weeFile.modified = false
      },
      closeFileWithSave (weeFile) {
        console.log('关闭并保存文件', weeFile)
        let uri = monaco.Uri.parse('file://' + weeFile.path)
        let model = monaco.editor.getModel(uri) // 如果该文档已经创建，打开则直接取得已存在的model
        let value = model.getValue()
        this.$set(weeFile, 'loading', true)
        fileService.saveFile(weeFile, value).then(_ => {
          this.$set(weeFile, 'loading', false)
        })
        model.dispose() // 此处也许可以继续保留
        weeFile.modified = false
      },
      docModified (modified) {
        console.log('docModified')
        // this.item.modified = modified
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
      readFile (weeFile) {
        console.log('开始读')
        // ==========model==========
        let t1 = new Date().getTime()
        let uri = monaco.Uri.parse('file://' + weeFile.path)
        let model = monaco.editor.getModel(uri) // 如果该文档已经创建，打开则直接取得已存在的model
        if (!model) {
          // 否则创建新的model
          this.$set(this.item, 'loading', true)
          let ret = fileService.readFileSync(weeFile.path)
          this.$set(this.item, 'loading', false)
          model = monaco.editor.createModel(ret, this.langName, uri) // 如 code="console.log('hello')", language="javascript"
        }
        let t2 = new Date().getTime()
        console.log('读【' + weeFile.title + '】耗时', (t2 - t1))
        this.content = model.getValue()
        this.showEdit = true
        this.monacoEditor.setModel(model)

        this.setRevealRange(weeFile.range)
        // ==========test==========
        // this.monacoEditor.trigger('ABC', 'editor.action.selectHighlights')
        // this.monacoEditor.trigger('', 'actions.find')
        // const selections = this.monacoEditor.getSelections()
        // console.log('selections', selections)
        // ==========test==========
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
            // this.monacoEditor.trigger('', 'editor.action.selectHighlights')
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
        this.monacoEditor.updateOptions({lineNumbers: this.editorOptions.lineNumbers ? 'on' : 'off'})
      },
      // 切换显示小地图
      setMiniMapOnOff () {
        this.monacoEditor.updateOptions({minimap: {enabled: this.editorOptions.minimap}})
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
            border-bottom: 1px solid #eee;
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
            border-top: 1px solid #eee;
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
                span{
                    margin: 0 5px;
                }
            }
        }

    }

</style>
