<template>
    <el-container style="height: 100%;">

        <el-header height="60px" style="padding: 0;">
            <div class="head-box">
                <span style="margin: 0 10px;">{{workspace}}</span>

                <el-input v-model="settingKey" placeholder="settingKey" style="width: 100px;"></el-input>
                <el-input v-model="settingValue" placeholder="settingValue" style="width: 100px;"></el-input>
                <el-button @click="saveSetting">save</el-button>
                <el-button @click="findSetting">find</el-button>
            </div>
        </el-header>

        <el-container>
            <!--主目录-->
            <el-aside class="resize-x" :width="asideWidthA + 'px'">
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
            </el-aside>

            <!--工作区-->
            <el-main style="padding: 0;">
                <MainTabs ref="MainTabs" :home="home" :activeFileList="activeFileList"
                          :activeFile="activeFile"></MainTabs>
            </el-main>

        </el-container>

    </el-container>

</template>

<script>
  import {remote, ipcRenderer} from 'electron'
  import MainTabs from '../components/MainTabs/MainTabs'
  import TreeMenu from '@/components/TreeMenu/TreeMenu'
  // import bookService from '@/service/BookService'
  import fileService from '@/service/FileService'
  import systemService from '@/service/SystemService'
  import BookList from '@/components/BookList/BookList'

  export default {
    name: 'Home',
    components: {
      BookList,
      MainTabs,
      TreeMenu
    },
    data () {
      return {
        home: this,
        asideWidthA: 200,

        // workspace: '/Users/yangqi/work/myproject/electron-all-projects/workspace',
        workspace: '',
        files: [],
        activeFile: {},
        activeFileList: [],

        settingKey: '',
        settingValue: ''
      }
    },
    watch: {
      // activeFile (v) {
      //   console.log('activeFile', v)
      // }
    },
    created () {
      console.log('Home created')
      this.workspace = remote.getGlobal('sharedObject').workspace
      this.initHome(this.workspace)
    },
    methods: {
      async initHome (workspace) {
        if (!workspace) {
          // 选择最后打开的目录
          let ret = await systemService.findOpenHistory()
          let li = []
          if (ret && ret.length > 0) {
            li = ret[0].value
          }
          if (li && li.length > 0) {
            workspace = li[li.length - 1]
            this.workspace = workspace
          }
        }
        if (!workspace) {
          return
        }
        remote.getGlobal('sharedObject').workspace = workspace
        // 读目录
        this.findFiles(workspace)
        // 记录历史
        this.saveOpenHistory(workspace)
      },
      deleteOpenHistory (path) {
        systemService.findOpenHistory().then(ret => {
          let li = []
          if (ret && ret.length > 0) {
            li = ret[0].value
          }
          if (li.includes(path)) {
            li.splice(li.indexOf(path), 1)
          }
          return systemService.saveOpenHistory(li)
        }).then(ret => {
          console.log('==========saveUserSetting==========', ret)
        })
      },
      async saveOpenHistory (path) {
        let ret = await systemService.findOpenHistory()
        let li = []
        if (ret && ret.length > 0) {
          li = ret[0].value
        }
        if (li.includes(path)) {
          li.splice(li.indexOf(path), 1)
        }
        if (li.length >= 10) {
          li.splice(0, 1)
        }
        li.push(path)
        this.updateOpenHistoryMenu(li)
        systemService.saveOpenHistory(li)
      },
      updateOpenHistoryMenu (li) {
        ipcRenderer.send('refresh-app-menu', li)
      },
      docModified (wteeFile, modified) {
        this.activeFileList.forEach((it, i) => {
          if (it.path === wteeFile.path) {
            it.modified = modified
            this.$set(this.activeFileList, i, it)
          }
        })
      },
      closeFile (index) {
        if (this.activeFileList[index].modified) {
          let ret = remote.dialog.showMessageBox(remote.getCurrentWindow(), {
            message: '是否要保存对 ' + this.activeFileList[index].title + ' 的更改?',
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
            this.$refs.MainTabs.$refs.MonacoEditor.closeFileWithSave(this.activeFileList[index])
          } else if (ret === 2) {
            console.log('不保存')
            this.$refs.MainTabs.$refs.MonacoEditor.closeFileWithoutSave(this.activeFileList[index])
          }
          this.removeActiveFileList(index)
          return
        }
        this.removeActiveFileList(index)
      },
      removeActiveFileList (index) {
        this.activeFileList.splice(index, 1)
        let has = false
        this.activeFileList.forEach((it, i) => {
          if (it.active) {
            has = true
          }
        })
        if (has) return
        if (this.activeFileList.length === 0) {
          this.activeFile = {}
          return
        }
        let it = this.activeFileList[this.activeFileList.length - 1]
        it.active = true
        this.$set(this.activeFileList, this.activeFileList.length - 1, it)
        this.activeFile = it
      },
      clickFile (wteeFile) {
        if (wteeFile.fileType === fileService.fileTypeEnum.DIR) return
        this.activeFile = wteeFile
        this.tryPushActiveFileList(wteeFile)
      },
      tryPushActiveFileList (wteeFile) {
        let has = false
        this.activeFileList.forEach((it, i) => {
          if (it.path === wteeFile.path) {
            has = true
            it.active = true
            this.$set(this.activeFileList, i, it)
            this.$refs.MainTabs.tabbarScrollTo(i)
          } else {
            it.active = false
            this.$set(this.activeFileList, i, it)
          }
        })
        if (has) return
        // if (this.activeFileList.length >= 2) {
        //   this.activeFileList.splice(0, 1)
        // }
        wteeFile.active = true
        this.activeFileList.push(wteeFile)
        this.$refs.MainTabs.tabbarScrollTo(this.activeFileList.length - 1)
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
      resize (e) {
        let ox = e.clientX
        let maxWidth = document.documentElement.clientWidth
        document.onmousemove = (e) => {
          let nx = e.clientX
          let offset = nx - ox
          ox = nx
          let w = this.asideWidthA + offset
          if (w >= 200 && maxWidth - w >= 200) {
            this.asideWidthA = w
          }
        }
        document.onmouseup = (e) => {
          document.onmousemove = null
          document.onmouseup = null
        }
      },
      dblclick () {
        this.asideWidthA = 200
      }
    }
  }
</script>

<style lang="less" scoped>

    @import '../common.less';

    .head-box {
        -webkit-user-select: none;
        -webkit-app-region: drag;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 191, 255, 0.97);
        display: flex;
        align-items: center;
        justify-content: flex-end;
        * {
            -webkit-app-region: no-drag;
        }
    }

    .resize-x {
        position: relative;
        .resize-line {
            width: 6px;
            height: 100%;
            /*background-color: green;*/
            position: absolute;
            right: 0;
            top: 0;
            cursor: ew-resize;
        }
    }

    .left-menu {
        width: calc(100% - 1px);
        height: 100%;
        border-right: 1px solid #ddd;
        background-color: white;
        .menu-top {
            width: calc(100% - 40px);
            /*width: 100%;*/
            height: 69px;
            padding: 0 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            align-items: center;
            justify-content: space-between;
            /*.active-directory-title {*/
            /*overflow: hidden;*/
            /*text-overflow: ellipsis;*/
            /*white-space: nowrap;*/
            /*}*/
        }
        .menu-content {
            width: 100%;
            height: calc(100% - 30px);
            overflow: scroll;
            .menu-inline-block {
                min-width: 100%;
                /*padding: 5px 0;*/
                /*border-top: 1px solid #eee;*/
                display: inline-block;
                .block-title {
                    border-top: 1px solid #eee;
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
            /*width: 100%;*/
            height: 29px;
            padding: 0 10px;
            border-top: 1px solid #eee;
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
                /*justify-content: center;*/
                /*overflow: hidden;*/
                /*text-overflow: ellipsis;*/
                white-space: nowrap;
            }
            .menu-bottom-m {
                max-width: 100%;
                display: flex;
                align-items: center;
                /*justify-content: center;*/
                /*overflow: hidden;*/
                /*text-overflow: ellipsis;*/
                white-space: nowrap;
            }
            .menu-bottom-r {
                max-width: 100%;
                display: flex;
                align-items: center;
                /*justify-content: center;*/
                /*overflow: hidden;*/
                /*text-overflow: ellipsis;*/
                white-space: nowrap;
            }
        }
    }

    /*.book-info {*/
    /*display: flex;*/
    /*align-items: center;*/
    /*!*justify-content: center;*!*/
    /*padding: 10px;*/
    /*-webkit-user-select: text;*/
    /*}*/

    /*.book-name {*/
    /*display: flex;*/
    /*align-items: center;*/
    /*justify-content: center;*/
    /*padding: 10px;*/
    /*-webkit-user-select: text;*/
    /*}*/

    /*.book-name::before {*/
    /*content: '《';*/
    /*}*/

    /*.book-name::after {*/
    /*content: '》';*/
    /*}*/

</style>
