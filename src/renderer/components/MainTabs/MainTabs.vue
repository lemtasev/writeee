<template>
    <div class="main-box">

        <div class="main-tabbar">
            <div class="main-tabbar-li">{{item.title}}</div>
        </div>

        <div class="main-container">

            <div v-show="!searchMode" class="title-box">
                <input class="title-ipt"
                       v-model="item.title" @blur="renameFile" @change="docModified"></input>
            </div>

            <div class="content-box">
                <!--<textarea ref="ta" v-show="showEdit" class="content-ipt" v-model="content" @keyup.enter="onEnter"-->
                <!--@keydown.tab="onTab" @blur="saveContent" @change="docModified"></textarea>-->
                <div v-show="showEdit" ref="monacoContainer" class="content-ipt"></div>
                <div v-show="!showEdit" class="content-message">
                    <i v-show="item.loading" class="el-icon-loading"></i>
                    <span>{{message}}</span>
                </div>
            </div>

            <div v-show="!searchMode" class="info-box">
                <div class="info-box-l">
                    <span>{{content ? content.length : 0}}/3000</span>
                </div>
                <div class="info-box-m">
                    <span>{{$moment(item.createTime).format('YYYY-MM-DD HH:mm:ss') || ''}}</span>
                </div>
                <div class="info-box-r">
                    <span>{{caretOffset}}</span>
                    <el-button size="mini" @click="setCursorPos(10)">setCursorPos</el-button>
                    <el-button size="mini" @click="saveContent">save</el-button>
                </div>
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

  import fileService from '@/service/FileService'
  import * as monaco from 'monaco-editor'

  export default {
    name: 'MainTabs',
    // components: {Editor},
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
        // title: '',
        content: '',
        // contentLength: 0
        showEdit: false,
        message: '',
        modified: false,
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
        caretOffset: null
      }
    },
    watch: {
      item (v, ov) {
        console.log('item', v, ov)
        if (v.path === ov.path) {
          console.log('恩同一文件，不重复读')
          return
        }
        this.showEdit = false
        this.content = ''
        this.message = ''
        if (v.fileType === fileService.fileTypeEnum.NORMAL) {
          if (v.blksize > 5 * 1024 * 1024) {
            this.message = '文件过大，无法打开！'
            return
          }
          this.readFile(v)
        }
      },
      hints (v, ov) {
        // 当提示项非空时，触发提示，能够使提示项更新并显示
        if (v.length > 0) {
          this.monacoEditor.trigger('提示', 'editor.action.triggerSuggest', {})
        }
      }
    },
    mounted () {
      console.log('mounted')
      let that = this
      let langName = this.langName
      // 设置含有custom-token class的主题
      monaco.editor.defineTheme(langName, {
        base: 'vs',
        inherit: true,
        rules: [
          { token: 'custom-number', foreground: '#ff2233', fontStyle: 'bold' },
          { token: 'custom-zh', foreground: '#808080' },
          { token: 'custom-en', foreground: '#2299ff' }
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
      this.monacoEditor = monaco.editor.create(this.$refs.monacoContainer, {
        value: this.content, // 见props
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
        // editorOptions: {}
      })
      this.monacoEditor.onDidChangeModelContent(e => {
        console.log('onDidChangeModelContent', e)
        this.caretOffset = e.changes[0].rangeOffset // 获取光标位置
        this.content = this.monacoEditor.getValue()
        this.docModified()
      })
      this.monacoEditor.onDidBlurEditorText(e => {
        console.log('onDidBlurEditorText', e)
        // this.saveContent()
      })

      this.monacoEditor.addCommand(monaco.KeyMod.WinCtrl | monaco.KeyCode.US_SLASH, function () {
        alert('?????????????!')
      })
    },
    methods: {
      docModified () {
        this.modified = true
      },
      // 定位光标到某个位置
      setCursorPos (sPos, ePos) {
        let obj = this.$refs.ta
        obj.focus()
        sPos = sPos || 0
        ePos = ePos || obj.value.length
        console.log('setCursorPos', sPos, ePos)
        obj.setSelectionRange(sPos, ePos)
      },
      renameFile () {
        if (!this.modified) return
        this.modified = false
        this.$set(this.item, 'loading', true)
        fileService.renameFile(this.item).then(_ => {
          this.$set(this.item, 'loading', false)
        })
      },
      readFile (weeFile) {
        console.log('开始读')
        this.$set(this.item, 'loading', true)
        // ==========model==========
        // let uri = monaco.Uri.parse('file://' + weeFile.path)
        // var model = monaco.editor.getModel(uri) // 如果该文档已经创建，打开则直接取得已存在的model
        // if (!model) {
        //   // 否则创建新的model
        //   model = monaco.editor.createModel('?', this.langName, uri) // 如 code="console.log('hello')", language="javascript"
        // }
        //
        // this.monacoEditor.setModel({
        //   model: model
        // })
        // // 也可以不指定uri参数，直接使用model = monaco.editor.createModel(code, language)，会自动分配一个uri
        // // let editor = monaco.editor.create(document.getElementById(container_id), {
        // //   model: model,
        // //   automaticLayout: true, // 构造选项，具体清单见上文链接
        // //   glyphMargin: true,
        // //   lightbulb: {
        // //     enabled: true
        // //   }
        // // })
        // ==========model==========

        fileService.readFile(weeFile.path).then(ret => {
          console.log('读回调')
          // this.content = ret
          this.monacoEditor.setValue(ret)
          this.showEdit = true
          this.$set(this.item, 'loading', false)
          // if (weeFile.sPos != null) {
          //   this.setCursorPos(weeFile.sPos, weeFile.ePos)
          // }
        })
        console.log('结束读')
      },
      saveContent () {
        if (!this.modified) return
        this.modified = false
        console.log(this.item)
        this.$set(this.item, 'loading', true)
        fileService.saveFile(this.item, this.content).then(_ => {
          this.$set(this.item, 'loading', false)
        })
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
        return { ln: line, col: column }
      },
      // 跳光标到给定位置
      setCursorPosition (editor, ln, col) {
        let pos = { lineNumber: ln, column: col }
        editor.setPosition(pos)
        // editor.revealPositionInCenter({ lineNumber: 99, column: 1 })
      },
      // 置焦点到某编辑器
      setFocus (editor) {
        editor.focus()
      },
      // 切换显示行号
      setLineNumberOnOff (editor, option) {
        // option === 'on' / 'off'
        if (option === 'on' || option === 'off') {
          editor.updateOptions({ lineNumbers: option })
        }
      },
      // 切换显示小地图
      setMinimapOnOff (editor, option) {
        // option === 'on' / 'off'
        if (option === 'on') {
          editor.updateOptions({ minimap: { enabled: true } })
        } else if (option === 'off') {
          editor.updateOptions({ minimap: { enabled: false } })
        }
      },
      // 字号
      setFontSize (editor, size) {
        editor.updateOptions({ fontSize: size })
      },
      // 字体
      setFontFamily (editor, family) {
        editor.updateOptions({ fontFamily: family })
      }
    }
  }
</script>

<style lang="less" scoped>

    @import '../../common.less';

    .main-box {
        width: 100%;
        height: 100%;
        background-color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .main-tabbar{
            width: 100%;
            height: 34px;
            display: flex;
            .main-tabbar-li{
                padding: 0 10px;
                height: 34px;
                line-height: 34px;
                background-color: #eee;
            }
        }
        .main-container{
            width: 100%;
            height: calc(100% - 34px);
            .title-box {
                width: calc(100% - 40px);
                height: 69px;
                padding: 0 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                align-items: center;
                .title-ipt {
                    width: 100%;
                    /*height: calc(100% - 190px);*/
                    /*resize: none;*/
                    /*padding: 60px;*/
                    border: none;
                    outline: none;
                    font-size: @fontSizeBig;
                }
            }
            .content-box {
                width: 100%;
                height: calc(100% - 100px);
                /*flex: 1;*/
                background-color: #eee;
                .content-ipt {
                    width: 100%;
                    height: 100%;
                    /*width: calc(100% - 120px);*/
                    /*height: calc(100% - 120px);*/
                    /*resize: none;*/
                    /*padding: 60px;*/
                    /*border: none;*/
                    /*outline: none;*/
                    /*<!--font-size: @fontSizeNormal;-->*/
                    /*font-family: 'Microsoft YaHei';*/
                    /*<!--color: @wxColorBlack;-->*/
                }
                .content-message {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
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
                }
            }
        }
    }

</style>
