<template>

    <div class="wc-container">

        <!--A-->
        <div class="wc-box" :class="{'active': !createMode}">
            <div class="wc-left">
                <template v-for="(item, i) in openHistoryList" :index="i.toString()">
                    <div class="open-history-li" :class="{'active': i === activeIndex}" :title="item"
                         @click="goWorkspace(i)"
                         @mouseenter="chooseThis(i)">
                        <div></div>
                        <span>{{item}}</span>
                        <div>
                            <i class="el-icon-close" @click.stop="deleteThis(i)"></i>
                        </div>
                    </div>
                </template>
            </div>
            <div class="wc-right">
                <img class="wc-logo" src="../../../../static/icon.jpg"/>
                <span>Version: {{version}}</span>
                <div class="wc-ope-line mt-40" @click="startCreate">
                    <i class="el-icon-plus"></i>
                    <span>新建工作空间</span>
                </div>
                <div class="wc-ope-line" @click="openWorkspace">
                    <i class="el-icon-folder-opened"></i>
                    <span>打开</span>
                </div>
            </div>
        </div>

        <!--B-->
        <div class="wc-box-create" :class="{'active': createMode}">
            <div class="wc-box-create-top">
                <el-button-group style="margin-right: 5%;">
                    <el-button size="small" @click="cancelCreate">取消</el-button>
                    <el-button size="small" type="primary" @click="confirmCreate">创建</el-button>
                </el-button-group>
            </div>
            <div class="wc-box-create-bottom">
                <el-form class="setting-form" size="mini" label-position="left" label-width="auto">

                    <el-form-item label="位置">
                        <el-input placeholder="请选择或输入一个目录" v-model="workspace">
                            <el-button slot="append" icon="el-icon-folder-opened" @click="chooseDirectory"></el-button>
                        </el-input>
                    </el-form-item>

                </el-form>
            </div>
        </div>

    </div>

</template>

<script>
  import fileService from '@/service/FileService'
  import * as openHistoryService from '@/service/OpenHistoryService'

  export default {
    name: 'Welcome',
    components: {
      // MonacoEditor
    },
    data () {
      return {
        version: '',
        activeIndex: 0,
        openHistoryList: [],
        createMode: false,
        workspace: ''
      }
    },
    created () {
      console.log(`${this.$options.name} created`)
      let that = this
      this.version = this.$electron.remote.getGlobal('sharedObject').version
      this.workspace = this.$electron.remote.getGlobal('sharedObject').defaultWorkspacePath
      openHistoryService.getOpenHistory().then(ret => {
        console.log(ret)
        this.openHistoryList = ret.reverse()
      })
      document.onkeydown = function (e) {
        if (that.activeIndex === 1) return
        if (e.key === 'ArrowUp') {
          that.onUpKeyDown()
        } else if (e.key === 'ArrowDown') {
          that.onDownKeyDown()
        } else if (e.key === 'Enter') {
          that.goWorkspace()
        }
      }
    },
    mounted () {
    },
    methods: {
      // onShow () {
      //   console.log(`${this.$options.name} onShow`)
      //   this.workspace = this.$electron.remote.getGlobal('sharedObject').defaultWorkspacePath
      //   openHistoryService.getOpenHistory().then(ret => {
      //     console.log(ret)
      //     this.openHistoryList = ret.reverse()
      //   })
      // },
      chooseDirectory () {
        let ret = this.$electron.remote.dialog.showOpenDialogSync(this.$electron.remote.getCurrentWindow(), {
          defaultPath: this.workspace,
          properties: ['openDirectory']
        })
        console.log(ret)
        if (!ret) return
        this.workspace = ret[0]
      },
      startCreate () {
        this.createMode = true
      },
      cancelCreate () {
        this.createMode = false
      },
      confirmCreate () {
        console.log('confirmCreate', this.workspace)
        if (fileService.existsPath(this.workspace)) {
          this.$electron.remote.dialog.showMessageBoxSync({
            message: '路径已被占用',
            detail: '请更改路径',
            type: 'warning' // "none", "info", "error", "question", "warning"
          })
        } else {
          console.log('创建目录，创建工作空间，打开目录')
          fileService.createWorkspace(this.workspace)
          // this.$electron.remote.getCurrentWindow().close()
          // this.$electron.ipcRenderer.send('open-workspace', this.workspace)
          this.$electron.remote.getGlobal('sharedObject').workspace = this.workspace
          this.$electron.remote.getCurrentWindow().reload()
        }
      },
      openWorkspace () {
        this.$electron.ipcRenderer.send('show-open')
      },
      goWorkspace (index) {
        index = index | this.activeIndex
        let item = this.openHistoryList[index]
        console.log(`goWorkspace【${item}】`)
        // this.$electron.ipcRenderer.send('open-workspace', item)
        this.$electron.remote.getGlobal('sharedObject').workspace = item
        this.$electron.remote.getCurrentWindow().reload()
      },
      deleteThis (index) {
        let item = this.openHistoryList[index]
        openHistoryService.deleteOpenHistory(item)
        this.openHistoryList.splice(index, 1)
      },
      chooseThis (index) {
        this.activeIndex = index
      },
      onUpKeyDown () {
        console.log('onUpKeyDown')
        if (this.activeIndex > 0) this.activeIndex--
      },
      onDownKeyDown () {
        console.log('onDownKeyDown')
        if (this.activeIndex < this.openHistoryList.length - 1) this.activeIndex++
      }
    }
  }
</script>

<style lang="less" scoped>

    @import '../../common.less';

    .wc-container {
        width: 100%;
        height: 100%;
        display: flex;
        overflow: hidden;
        .wc-box {
            margin-left: -100%;
            width: 100%;
            height: 100%;
            display: flex;
            flex: none;
            transition: all 0.3s;
            .wc-left {
                width: 300px;
                height: 100%;
                background-color: white;
                overflow-y: scroll;
                .open-history-li {
                    padding: 10px 0;
                    display: flex;
                    div {
                        width: 10%;
                        i {
                            color: #eee;
                            opacity: 0;
                        }
                    }
                    span {
                        width: 80%;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                }
                .open-history-li.active {
                    background-color: @themeColor;
                    span {
                        color: white;
                    }
                }
                .open-history-li:hover > div > i {
                    opacity: 1;
                }
                .open-history-li > div > i:hover {
                    color: white;
                }
            }
            .wc-right {
                border-left: 1px solid @colorBorder;
                flex: auto;
                height: 100%;
                background-color: #f7f7f7;
                display: flex;
                flex-direction: column;
                align-items: center;
                .wc-logo {
                    width: 100px;
                    padding: 20px;
                }
                .wc-ope-line {
                    width: 200px;
                    margin: 10px 0;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    i {
                        padding: 0 10px;
                        font-size: @fontSizeNormal;
                    }
                    span {
                        font-size: @fontSizeNormal;
                    }
                }
                .wc-ope-line:hover {
                    span {
                        color: @fontColorBlackActive;
                    }
                }
            }
        }
        .wc-box-create {
            margin-left: 100%;
            width: 100%;
            height: 100%;
            flex: none;
            transition: all 0.3s;
            .wc-box-create-top {
                width: 100%;
                height: 60px;
                background-color: @themeColor;
                display: flex;
                align-items: center;
                justify-content: flex-end;
            }
            .wc-box-create-bottom {
                width: 100%;
                height: calc(100% - 60px);
                background-color: @themeColor20;
            }
        }
        .wc-box.active, .wc-box-create.active {
            margin-left: 0;
        }
    }

    .setting-form {
        padding: 5px 5%;
        width: 90%;
    }

</style>
