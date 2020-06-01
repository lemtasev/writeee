<template>
    <div class="main-box">
        <div class="title-box">
            <input class="title-ipt"
                   v-model="item.title || ''"></input>
        </div>
        <div class="content-box">
            <textarea class="content-ipt" v-model="item.content || ''" @keyup.enter="onEnter" @keydown.tab="onTab"></textarea>
        </div>
        <div class="info-box">
            <div class="info-box-l">
                <span>{{item.content ? item.content.length : 0}}/3000</span>
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
        // content: '',
        // contentLength: 0
      }
    },
    watch: {
      // content () {
      //   if (this.content) {
      //     this.contentLength = this.content.length
      //   } else {
      //     this.contentLength = 0
      //   }
      // }
    },
    methods: {
      saveContent () {
        console.log(this.item)
        fileService.updateFile(this.item).then(
          ret => {
            console.log('fileService.updateFile ret', ret)
            this.home.findDirectoryContent()
          }
        )
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
        .content-box{
            width: 100%;
            height: calc(100% - 100px);
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
            .info-box-l{
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .info-box-m{
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .info-box-r{
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
    }

</style>
