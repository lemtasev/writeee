<template>
    <div class="main-box">
        <div class="title-box">
            <input class="title-ipt"
                   v-model="item.title" @blur="renameFile"></input>
        </div>
        <div class="content-box">
            <textarea v-show="item.fileType == 'normal'" class="content-ipt" v-model="content" @keyup.enter="onEnter"
                      @keydown.tab="onTab" @blur="saveContent"></textarea>
        </div>
        <div class="info-box">
            <div class="info-box-l">
                <span>{{content ? content.length : 0}}/3000</span>
            </div>
            <div class="info-box-m">
                <span>{{$moment(item.createTime).format('YYYY-MM-DD HH:mm:ss') || ''}}</span>
            </div>
            <div class="info-box-r">
                <el-button size="mini" @click="saveContent">save</el-button>
            </div>
        </div>
    </div>
</template>

<script>
  // import redis from 'redis'
  // import Editor from '@/components/Editor/Editor'
  import fileService from '@/service/FileService'

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
      }
    },
    data () {
      return {
        // title: '',
        content: '',
        // contentLength: 0
        fd: null,
        buf: null
      }
    },
    watch: {
      item (v) {
        console.log('item', v)
        if (v.fileType === fileService.fileTypeEnum.NORMAL) {
          this.readFile(v)
        } else {
          this.content = ''
        }
      }
    },
    methods: {
      renameFile () {
        this.$set(this.item, 'loading', true)
        fileService.renameFile(this.item).then(_ => {
          this.$set(this.item, 'loading', false)
        })
      },
      readFile (weeFile) {
        fileService.readFile(weeFile.path).then(ret => {
          this.content = ret
        })
      },
      saveContent () {
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
            height: calc(100% - 100px);
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
