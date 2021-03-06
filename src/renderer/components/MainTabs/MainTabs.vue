<template>
    <div class="main-box">

        <div class="main-tabbar" ref="MainTabbar">

            <template v-for="(item, i) in openedFileList" :index="i.toString()">
                <div class="main-tabbar-li" :class="{'active' : item.active}" :title="item.path"
                     @click="clickTabbar(i)"
                     @contextmenu="tabbarContextMenu(i)">
                    <div class="left">
                        <i v-show="item.modified" class="modified-flag"></i>

                        <!--图标-->
                        <i v-if="item.fileType == fileTypeEnum.DIR" class="menu-icon"
                           :class="{'el-icon-folder-opened' : item.isOpen, 'el-icon-folder' : !item.isOpen}"></i>
                        <i v-else-if="item.fileType == fileTypeEnum.CHAPTER" class="menu-icon el-icon-document"></i>
                        <i v-else-if="item.fileType == fileTypeEnum.IMG" class="menu-icon el-icon-picture"></i>
                        <i v-else-if="item.fileType == fileTypeEnum.CHARACTER" class="menu-icon el-icon-user-solid"></i>
                        <i v-else-if="item.fileType == fileTypeEnum.SECT" class="menu-icon el-icon-house"></i>
                        <i v-else-if="item.fileType == fileTypeEnum.SKILL" class="menu-icon el-icon-moon"></i>
                        <i v-else-if="item.fileType == fileTypeEnum.PLACE" class="menu-icon el-icon-location"></i>
                        <i v-else-if="item.fileType == fileTypeEnum.PROP" class="menu-icon el-icon-takeaway-box"></i>
                        <i v-else-if="item.fileType == fileTypeEnum.MONSTER" class="menu-icon el-icon-warning"></i>
                        <i v-else-if="item.fileType == fileTypeEnum.OUTLINE" class="menu-icon el-icon-tickets"></i>
                        <i v-else-if="item.fileType == fileTypeEnum.REFERENCE" class="menu-icon el-icon-paperclip"></i>
                        <i v-else-if="item.fileType == fileTypeEnum.UNKNOWN" class="menu-icon el-icon-question"></i>

                        <span>{{item.title}}</span>
                        <i v-show="item.loading" class="el-icon-loading"></i>
                    </div>
                    <div class="right">
                        <i class="close-btn el-icon-close" @click.stop="closeTab(i)"></i>
                    </div>
                </div>
            </template>

        </div>

        <div class="main-container">

            <div v-show="openedFileList.length === 0" style="width: 100%;height: 100%;display: flex;align-items: center;justify-content: center;">
                None Tab
            </div>
            <Welcome v-show="openedFileList.length > 0 && openedFile.path === 'Welcome'"></Welcome>
            <MonacoEditor v-show="openedFileList.length > 0 && openedFile.path !== 'Welcome'" ref="MonacoEditor" :home="home" :item="openedFile"></MonacoEditor>

        </div>

    </div>
</template>

<script>
  import Welcome from '@/components/Welcome/Welcome'
  import MonacoEditor from '@/components/MonacoEditor/MonacoEditor'
  import fileService from '@/service/FileService'

  export default {
    name: 'MainTabs',
    components: {Welcome, MonacoEditor},
    props: {
      home: {
        type: Object,
        default: {}
      },
      openedFileList: {
        type: Array,
        default: []
      },
      openedFile: {
        type: Object,
        default: {}
      }
    },
    data () {
      return {
        fileTypeEnum: {}
      }
    },
    created () {
      console.log(`${this.$options.name} created`)
      this.fileTypeEnum = fileService.fileTypeEnum
    },
    watch: {},
    methods: {
      tabbarContextMenu (i) {
        let userFolderContextMenuJson = [
          {
            label: '关闭',
            click: () => {
              this.closeTab(i)
            }
          },
          {
            label: '关闭其他',
            click: () => {
              let len = this.openedFileList.length
              for (let j = 0; j < len; j++) {
                if (j < i) {
                  this.closeTab(0)
                } else if (j > i) {
                  this.closeTab(1)
                }
              }
            }
          },
          {
            label: '关闭全部',
            click: () => {
              let len = this.openedFileList.length
              for (let j = 0; j < len; j++) {
                this.closeTab(0)
              }
            }
          },
          {
            label: '关闭未修改文件',
            click: () => {
              let len = this.openedFileList.length
              let delIdx = 0
              for (let j = 0; j < len; j++) {
                if (!this.openedFileList[delIdx].modified) {
                  this.closeTab(delIdx)
                } else {
                  delIdx++
                }
              }
            }
          },
          {type: 'separator'},
          {
            label: '在文件夹中显示',
            click: () => {
              this.$electron.shell.showItemInFolder(this.openedFileList[i].path)
            }
          }
        ]
        let contextMenu = this.$electron.remote.Menu.buildFromTemplate(userFolderContextMenuJson)
        contextMenu.popup({window: this.$electron.remote.getCurrentWindow()})
      },
      clickTabbar (i) {
        this.home.openFile(this.openedFileList[i])
      },
      closeTab (i) {
        this.home.closeFile(i)
      },
      tabbarScrollTo (i) {
        setTimeout(_ => {
          let parentOffsetLeft = this.$refs.MainTabbar.offsetLeft
          let childOffsetLeft = this.$refs.MainTabbar.children[i].offsetLeft
          this.$refs.MainTabbar.scrollLeft = childOffsetLeft - parentOffsetLeft
        }, 0)
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

        .main-tabbar::-webkit-scrollbar {
            display: none; /* Chrome Safari 隐藏滚动条*/
        }
        .main-tabbar {
            width: 100%;
            display: flex;
            background-color: #ececec;
            overflow-x: scroll;
            .main-tabbar-li {
                min-width: 120px;
                padding: 0 10px;
                height: 34px;
                border-right: 1px solid @colorBorder;
                cursor: default;
                display: flex;
                flex: none;
                align-items: center;
                justify-content: space-between;
                transition: all 0.3s;
                .left {
                    display: flex;
                    align-items: center;
                    span {
                        white-space: nowrap;
                    }
                }
                .right {
                    display: flex;
                    align-items: center;
                    .close-btn {
                        padding: 5px;
                        margin-left: 5px;
                        transition: all 0.3s;
                    }
                    .close-btn:hover {
                        border-radius: 50%;
                        background-color: #eee;
                        color: black;
                    }
                }
                .modified-flag {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background-color: #09bb07;
                    margin: 0 5px;
                }
                .menu-icon {
                    margin: 0 5px;
                }
            }
            .main-tabbar-li.active {
                background-color: white;
                border-radius: 10px 10px 0px 0px;
            }
            .main-tabbar-li:not(.active):hover {
                background-color: #d3d3d3;
                border-radius: 10px 10px 0px 0px;
            }
        }
        .main-container {
            width: 100%;
            height: calc(100% - 34px);
        }
    }

</style>
