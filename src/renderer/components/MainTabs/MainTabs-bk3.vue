<template>
    <div class="main-box">
        <div class="title-box">
            <input class="title-ipt"
                   v-model="title"></input>
        </div>
        <div class="content-box">
            <div class="content-ipt" @input="onInput" @keyup.enter="onEnter" @keydown.tab="onTab" contenteditable="plaintext-only">

            </div>
        </div>
        <div class="info-box">
            <div class="info-box-l">
                <span>{{contentLength}}/3000</span>
            </div>
            <div class="info-box-m">
                <span>2020-03-27 09:15:30</span>
            </div>
            <div class="info-box-r">
                <el-button size="mini" @click="setText">set</el-button>
                <el-button size="mini" @click="getText">Text</el-button>
                <el-button size="mini" @click="getHtml">Html</el-button>
            </div>
        </div>
    </div>
</template>

<script>
  // import redis from 'redis'
  import Editor from '@/components/Editor/Editor'

  export default {
    name: 'MainTabs',
    components: {Editor},
    data () {
      return {
        title: '腾云',
        content: '12345，腾云驾雾。ABCDE,abcde.\n\t12345，腾云驾雾。ABCDE,abcde.\n12345，腾云驾雾。ABCDE,abcde.\n12345，腾云驾雾。ABCDE,abcde.\n12345，腾云驾雾。ABCDE,abcde.',
        contentLength: 0
      }
    },
    watch: {
      content () {
        if (this.content) {
          this.contentLength = this.content.length
        } else {
          this.contentLength = 0
        }
      }
    },
    methods: {
      setText () {
        this.$refs.edit.setContent('12345，上山打老虎。ABCDE,abcde.12345，上山打老虎。ABCDE,abcde.12345，上山打老虎。ABCDE,abcde.')
      },
      getText () {
        console.log(this.$refs.edit.getText())
      },
      getHtml () {
        console.log(this.$refs.edit.getHtml())
      },
      onInput (e) {
        console.log('onInput', e)
        this.content = e.target.innerText
      },
      onTab (e) {
        console.log('onTab', e)
        e.returnValue = false // 阻止默认事件
        let indent = '    '
        let selection = window.getSelection()
        // let range = selection.getRangeAt(0)
        // let node = range.createContextualFragment(indent)
        // range.insertNode(node)

        // 获取光标的range对象
        let range = selection.getRangeAt(0)
        // 光标的偏移位置
        let startOffset = range.startOffset
        let endOffset = range.endOffset
        // 新建一个tab符
        let node = range.createContextualFragment(indent)
        // 创建一个新的range对象
        let newrange = document.createRange()
        // 设置新的range的位置，也是插入元素的位置
        newrange.setStart(range.startContainer, startOffset)
        newrange.setEnd(range.endContainer, endOffset)
        newrange.collapse(true)
        newrange.insertNode(node)
        // 去掉旧的range对象，用新的range对象替换
        selection.removeAllRanges()
        selection.addRange(range)
        // 将光标的位置向后移动一个偏移量，放到加入的四个空格后面
        // range.setStart(0, 1)
        // range.setEnd(0, 1)
      },
      onEnter () {
        console.log('onEnter')
        this.content += '\t'
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
                width: calc(100% - 120px);
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
