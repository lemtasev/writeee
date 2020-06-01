<template>
    <div class="edit-box">

        <div ref="toolbar" class="toolbar"></div>
        <div ref="editor" class="text"></div>

    </div>
</template>

<script>
  import E from 'wangeditor'

  export default {
    name: 'Editor',
    data () {
      return {
        editor: null
      }
    },
    mounted () {
      let editor = new E(this.$refs.toolbar, this.$refs.editor)
      // 自定义语言
      editor.customConfig.lang = {
        'x-small': '极小',
        'small': '偏小',
        'normal': '正常',
        'large': '大'
        // 还可自定添加更多
      }

      editor.customConfig.menus = [
        // 'head', // 标题
        // 'bold', // 粗体
        'fontSize', // 字号
        'fontName', // 字体
        // 'italic', // 斜体
        // 'underline', // 下划线
        // 'strikeThrough', // 删除线
        // 'foreColor', // 文字颜色
        // 'backColor', // 背景颜色
        // 'link', // 插入链接
        // 'list', // 列表
        // 'justify', // 对齐方式
        // 'quote', // 引用
        // 'emoticon', // 表情
        // 'image', // 插入图片
        // 'table', // 表格
        // 'video', // 插入视频
        // 'code', // 插入代码
        'undo', // 撤销
        'redo' // 重复
      ]

      // 自定义字体
      editor.customConfig.fontNames = [
        '宋体',
        '微软雅黑',
        'Arial',
        'Tahoma',
        'Verdana'
      ]

      // 自定义配置颜色（字体颜色、背景色）
      editor.customConfig.colors = [
        '#000000',
        '#eeece0',
        '#1c487f',
        '#4d80bf',
        '#c24f4a',
        '#8baa4a',
        '#7b5ba1',
        '#46acc8',
        '#f9963b',
        '#ffffff'
      ]

      // 表情面板可以有多个 tab ，因此要配置成一个数组。数组每个元素代表一个 tab 的配置
      // editor.customConfig.emotions = [
      //   {
      //     // tab 的标题
      //     title: '默认',
      //     // type -> 'emoji' / 'image'
      //     type: 'image',
      //     // content -> 数组
      //     content: [
      //       {
      //         alt: '[坏笑]',
      //         src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/50/pcmoren_huaixiao_org.png'
      //       }
      //     ]
      //   },
      //   {
      //     // tab 的标题
      //     title: 'emoji',
      //     // type -> 'emoji' / 'image'
      //     type: 'emoji',
      //     // content -> 数组
      //     content: ['😀', '😃', '😄', '😁', '😆']
      //   }
      // ]

      editor.customConfig.debug = true // 是否开启Debug 默认为false 建议开启 可以看到错误
      editor.customConfig.pasteIgnoreImg = true // 粘贴忽略图片
      editor.customConfig.pasteFilterStyle = true // 粘贴过滤样式

      // 只粘贴纯文本 （注意，如果你在上面设置了 editor.config.pasteFilter = false 那么这个粘贴纯文本的设置将失效）
      // editor.config.pasteText = true // 在v3里面无效

      // 自定义处理粘贴的文本内容
      editor.customConfig.pasteTextHandle = function (content) {
        // content 即粘贴过来的内容（html 或 纯文本），可进行自定义处理然后返回
        console.log(content)
        return ''
      }

      this.$refs.editor.addEventListener('paste', (e) => {
        e.preventDefault()
        // 获得纯文本
        const value = e.clipboardData.getData('text/plain')
        // 然后手动执行粘贴
        document.execCommand('insertText', false, value)
      })

      // 输入事件
      // editor.customConfig.onchange = (html) => {
      //   store.dispatch('onChangeNewsContent', html)
      // }

      // 图片上传
      // editor.customConfig.uploadImgServer = process.env.UPLOAD_API + 'upload/upload_pic'
      // editor.customConfig.uploadFileName = 'file'
      // editor.customConfig.uploadImgHooks = {
      //   error: function (xhr, editor) {
      //     alert('图片并没有上传，请检查图片服务是否正常')
      //   },
      //   fail: function (xhr, editor, result) {
      //     alert('图片上传了，但是并没有成功回显')
      //   },
      //   success: function (xhr, editor, result) {
      //     console.log('图片上传成功', result)
      //   },
      //   customInsert: function (insertImg, result, editor) {
      //     insertImg(result.data)
      //   }
      // }
      editor.create()
      this.editor = editor
    },
    methods: {
      setContent: function (content) {
        this.editor.txt.html(content)
      },
      getHtml () {
        return this.editor.txt.html()
      },
      getText () {
        return this.editor.txt.text()
      }
    }
  }
</script>

<style lang="less" scoped>

    .edit-box {
        width: 100%;
        height: 100%;
        .toolbar {
            height: 49px;
            border-bottom: 1px solid #eee;
            display: flex;
            align-items: center;
        }
        .text {
            /*border: 1px solid #ccc;*/
            height: calc(100% - 50px);
        }
    }

</style>
