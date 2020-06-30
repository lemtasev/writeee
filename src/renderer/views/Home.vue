<template>
    <div class="home-container">

        <div class="home-header">
            <span style="margin: 0 10px;">{{workspace}}</span>

            <!--<el-input v-model="settingKey" placeholder="settingKey" style="width: 100px;"></el-input>-->
            <!--<el-input v-model="settingValue" placeholder="settingValue" style="width: 100px;"></el-input>-->
            <!--<el-button @click="saveSetting">save</el-button>-->
            <!--<el-button @click="findSetting">find</el-button>-->

            <el-input v-model="search.searchInfo" size="mini" placeholder="全局搜索" style="width: 200px;margin-right: 10px;"
                      @keyup.enter.native="openSearchPage">
                <el-button slot="append" icon="el-icon-search" @click="openSearchPage"></el-button>
            </el-input>
        </div>

        <div class="home-body">
            <!--主目录-->
            <div class="body-aside" :style="{'width': asideWidth + 'px'}">
                <div class="left-menu">

                    <div class="menu-content">

                        <div v-if="workspace" class="menu-inline-block">

                            <div class="block-title border-top-none">工作空间</div>
                            <template v-for="(item, index) in files" :index="index.toString()">
                                <TreeMenu :item="item" :index="index" :home="home"></TreeMenu>
                            </template>

                        </div>

                        <div v-else class="no-workspace">
                            <div>没有选择工作空间</div>
                            <button>打开</button>
                        </div>

                    </div>

                    <div class="menu-bottom">
                        <div class="menu-bottom-l">
                            <span :title="activeFile.path">{{activeFile.path}}</span>
                        </div>
                    </div>

                </div>
                <div class="resize-line" @mousedown="resize($event)" @dblclick="dblclick"></div>
            </div>

            <!--工作区-->
            <div class="body-main" :style="{'width': 'calc(100% - ' + asideWidth + 'px)'}">
                <MainTabs ref="MainTabs" :home="home" :openedFileList="openedFileList"
                          :openedFile="openedFile"></MainTabs>
            </div>

        </div>

        <!--搜索组件抽屉-->
        <el-drawer :visible.sync="search.visible" direction="rtl" :show-close="false" :withHeader="false" size="700px">
            <Search :home="home" :searchInfo="search.searchInfo"></Search>
        </el-drawer>

    </div>

</template>

<script>
  // import {remote, ipcRenderer} from 'electron'
  import MainTabs from '../components/MainTabs/MainTabs'
  import TreeMenu from '@/components/TreeMenu/TreeMenu'
  // import bookService from '@/service/BookService'
  import fileService from '@/service/FileService'
  import systemService from '@/service/SystemService'
  import * as openHistoryService from '@/service/OpenHistoryService'
  import Search from '@/components/Search/Search'

  export default {
    name: 'Home',
    components: {
      MainTabs,
      TreeMenu,
      Search
    },
    data () {
      return {
        home: this,
        asideWidth: 200,
        workspace: '',

        files: [],
        openedFile: {}, // 打开的文件
        openedFileList: [], // 打开的文件列表
        activeFile: {}, // 菜单激活的文件

        search: {
          visible: false,
          searchInfo: ''
        },

        settingKey: '',
        settingValue: ''
      }
    },
    watch: {
      asideWidth (v) {
        console.log('【automaticLayout: true】这个问题将在下一个monaco版本被修复', v)
        setTimeout(() => {
          this.$refs.MainTabs.$refs.MonacoEditor.layoutMonaco()
        }, 0)
      }
    },
    created () {
      console.log(`${this.$options.name} created`)
      this.workspace = this.$electron.remote.getGlobal('sharedObject').workspace
      this.initHome(this.workspace)
    },
    mounted () {
      window.vueCmp = this
    },
    methods: {
      onShow () {
        console.log(`${this.$options.name} onShow`)
      },
      async initHome (workspace) {
        if (!workspace) {
          return
        }
        // 读目录
        this.findFiles(workspace)
        // 记录历史
        openHistoryService.saveOpenHistory(workspace)
      },
      docModified (wteeFile, modified) {
        this.openedFileList.forEach((it, i) => {
          if (it.path === wteeFile.path) {
            it.modified = modified
            this.$set(this.openedFileList, i, it)
          }
        })
      },
      closeFile (index) {
        if (this.openedFileList[index].modified) {
          let ret = this.$electron.remote.dialog.showMessageBoxSync(this.$electron.remote.getCurrentWindow(), {
            message: '是否要保存对 ' + this.openedFileList[index].title + ' 的更改?',
            detail: '如果不保存，你的更改将丢失。',
            type: 'warning',
            buttons: ['保存', '取消', '不保存'],
            defaultId: 0,
            cancelId: 1
          })
          if (ret === 1) {
            console.log('取消')
            return
          }
          if (ret === 0) {
            console.log('保存')
            this.$refs.MainTabs.$refs.MonacoEditor.closeFileWithSave(this.openedFileList[index])
          } else if (ret === 2) {
            console.log('不保存')
            this.$refs.MainTabs.$refs.MonacoEditor.closeFileWithoutSave(this.openedFileList[index])
          }
          this.removeActiveFileList(index)
          return
        }
        this.removeActiveFileList(index)
      },
      removeActiveFileList (index) {
        this.openedFileList.splice(index, 1)
        let has = false
        this.openedFileList.forEach((it, i) => {
          if (it.active) {
            has = true
          }
        })
        if (has) return
        if (this.openedFileList.length === 0) {
          this.openedFile = {}
          return
        }
        let it = this.openedFileList[this.openedFileList.length - 1]
        it.active = true
        this.$set(this.openedFileList, this.openedFileList.length - 1, it)
        this.openedFile = it
      },
      clickFile (wteeFile) {
        this.activeFile = wteeFile
      },
      openFile (wteeFile) {
        this.clickFile(wteeFile)
        if (wteeFile.fileType === fileService.fileTypeEnum.DIR) return
        this.tryPushActiveFileList(wteeFile)
      },
      tryPushActiveFileList (wteeFile) {
        this.openedFile = wteeFile
        let has = false
        this.openedFileList.forEach((it, i) => {
          if (it.path === wteeFile.path) {
            has = true
            it.active = true
            this.$set(this.openedFileList, i, it)
            this.$refs.MainTabs.tabbarScrollTo(i)
          } else {
            it.active = false
            this.$set(this.openedFileList, i, it)
          }
        })
        if (has) return
        // if (this.openedFileList.length >= 5) {
        //   this.openedFileList.splice(0, 1)
        // }
        wteeFile.active = true
        this.openedFileList.push(wteeFile)
        this.$refs.MainTabs.tabbarScrollTo(this.openedFileList.length - 1)
      },
      saveSetting () {
        systemService.saveUserSetting(this.settingKey, this.settingValue).then(ret => {
          console.log(ret)
        })
      },
      findSetting () {
        systemService.findUserSetting(this.settingKey).then(ret => {
          console.log(ret)
        })
      },
      findFiles (path) {
        fileService.findFiles(path).then(ret => {
          this.files = ret
        })
      },
      resize (event) {
        let ox = event.clientX
        let maxWidth = document.documentElement.clientWidth
        document.onmousemove = (e) => {
          let nx = e.clientX
          let offset = nx - ox
          ox = nx
          let w = this.asideWidth + offset
          if (w >= 200 && maxWidth - w >= 200) {
            this.asideWidth = w
          }
        }
        document.onmouseup = (e) => {
          document.onmousemove = null
          document.onmouseup = null
        }
      },
      dblclick () {
        this.asideWidth = 200
      },
      openSearchPage () {
        this.search.visible = true
        console.log('openSearchPage', this.search.visible)
      }
    }
  }
</script>

<style lang="less" scoped>

    @import '../common.less';

    .home-container{
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        .home-header{
            width: 100%;
            height: 60px;
            -webkit-user-select: none;
            -webkit-app-region: drag;
            background-color: @themeColor;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            * {
                -webkit-app-region: no-drag;
            }
        }
        .home-body{
            width: 100%;
            height: calc(100% - 60px);
            display: flex;
            .body-aside {
                position: relative;
                height: 100%;
                .resize-line {
                    width: 6px;
                    height: 100%;
                    position: absolute;
                    right: 0;
                    top: 0;
                    cursor: ew-resize;
                }
                .left-menu {
                    width: calc(100% - 1px);
                    height: 100%;
                    border-right: 1px solid @colorBorder;
                    background-color: white;
                    .menu-top {
                        width: calc(100% - 40px);
                        height: 69px;
                        padding: 0 20px;
                        border-bottom: 1px solid @colorBorder;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }
                    .menu-content {
                        width: 100%;
                        height: calc(100% - 30px);
                        overflow: scroll;
                        .menu-inline-block {
                            min-width: 100%;
                            display: inline-block;
                            .block-title {
                                border-top: 1px solid @colorBorder;
                                width: calc(100% - 20px);
                                padding: 4px 10px;
                                font-size: @fontSizeMicro;
                                color: @wxColorGray;
                            }
                        }
                        .no-workspace {
                            width: 100%;
                            height: 100%;
                        }
                    }
                    .menu-bottom {
                        width: calc(100% - 20px);
                        height: 29px;
                        padding: 0 10px;
                        border-top: 1px solid @colorBorder;
                        display: flex;
                        font-size: @fontSizeTiny;
                        color: @wxColorGray;
                        align-items: center;
                        justify-content: space-between;
                        overflow: hidden;
                        .menu-bottom-l {
                            max-width: 100%;
                            display: flex;
                            align-items: center;
                            white-space: nowrap;
                        }
                        .menu-bottom-m {
                            max-width: 100%;
                            display: flex;
                            align-items: center;
                            white-space: nowrap;
                        }
                        .menu-bottom-r {
                            max-width: 100%;
                            display: flex;
                            align-items: center;
                            white-space: nowrap;
                        }
                    }
                }
            }
            .body-main{
                height: 100%;
                flex: auto;
                background-color: #60d2f9;
            }
        }
    }

</style>
