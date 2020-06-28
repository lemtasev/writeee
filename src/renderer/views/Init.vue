<template>

    <div class="init-container">

        <div class="init-line">正在加载</div>

        <div class="progress-box">
            <el-progress :percentage="percentage"
                         :color="progressColor"
                         :show-text="false"></el-progress>
        </div>

    </div>

</template>

<script>
  import systemService from '@/service/SystemService'
  // import * as openHistoryService from '@/service/OpenHistoryService'

  export default {
    name: 'Init',
    components: {
      // MonacoEditor
    },
    data () {
      return {
        percentage: 0,
        progressColor: '#2f6ade',
        workspace: ''
      }
    },
    watch: {
      percentage (v) {
        console.log('percentage', v)
        if (v === 100) {
          console.log('init ready')
          console.log('workspace', this.workspace)
          setTimeout(() => {
            if (this.workspace) {
              // open home page
              this.$electron.remote.getGlobal('sharedObject').workspace = this.workspace
              this.$electron.ipcRenderer.send('open-main-window')
            } else {
              // open Welcome page
              this.$electron.ipcRenderer.send('open-welcome-window')
            }
            // close this page
            this.$electron.remote.getCurrentWindow().close()
          }, 1000)
        }
      }
    },
    created () {
      console.log(`${this.$options.name} created`)

      this.initMenu(() => {
        this.percentage += 100
      })
    },
    methods: {
      async initMenu (callback) {
        let ret = await systemService.findOpenHistory()
        let li = []
        if (ret && ret.length > 0) {
          li = ret[0].value
        }
        if (li && li.length > 0) {
          this.workspace = li[li.length - 1]
        }
        this.$electron.ipcRenderer.send('refresh-app-menu', {original: true})
        callback()
      }
    }
  }
</script>

<style lang="less" scoped>

    @import '../common.less';

    .init-container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background-color: @themeColor;
        .init-line{
            padding: 10px 0;
            width: 90%;
            color: white;
        }
        .progress-box{
            padding: 10px 0;
            width: 90%;
        }
    }

</style>
