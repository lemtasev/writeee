<template>
    <div class="main-box">

        <div v-show="!searchMode" class="title-box">
            <input class="title-ipt"
                   v-model="item.title" @blur="renameFile" @change="docModified"></input>
        </div>

        <div class="content-box">
            <textarea ref="ta" v-show="showEdit" class="content-ipt" v-model="content" @keyup.enter="onEnter"
                      @keydown.tab="onTab" @blur="saveContent" @change="docModified"></textarea>
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
                <el-button size="mini" @click="setCursorPos(10)">setCursorPos</el-button>
                <el-button size="mini" @click="saveContent">save</el-button>
            </div>
        </div>

    </div>
</template>

<script>
  // import MonacoEditor from '@/components/MonacoEditor/MonacoEditor'
  import fileService from '@/service/FileService'

  export default {
    name: 'MainTabs',
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
        // title: '',
        content: '',
        // contentLength: 0
        showEdit: false,
        message: '',
        modified: false
      }
    },
    watch: {
      item (v, ov) {
        console.log('item', v, ov)
        if (v.path === ov.path && v.ePos === ov.ePos) return
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
      }
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
        fileService.readFile(weeFile.path).then(ret => {
          console.log('读回调')
          this.content = ret
          this.showEdit = true
          this.$set(this.item, 'loading', false)
          if (weeFile.sPos != null) {
            // setTimeout(_ => this.setCursorPos(weeFile.sPos, weeFile.ePos), 1000)
            this.setCursorPos(weeFile.sPos, weeFile.ePos)
          }
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
      onTab (e) {
        console.log('onTab', e)
        e.returnValue = false // 阻止默认事件
        document.execCommand('insertText', false, '\t')
      },
      onEnter () {
        console.log('onEnter')
        document.execCommand('insertText', false, '\t')
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
            /*height: calc(100% - 100px);*/
            flex: 1;
            background-color: #eee;
            .content-ipt {
                width: calc(100% - 120px);
                height: calc(100% - 120px);
                resize: none;
                padding: 60px;
                border: none;
                outline: none;
                font-size: @fontSizeNormal;
                font-family: 'Microsoft YaHei';
                color: @wxColorBlack;
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

</style>
