<template>

    <div class="tree-menu-item">
        <div class="tree-menu-item-content" :class="{'active' : item.path === home.activeFile.path}" :title="item.title"
             @click="clickFile"
             @dblclick="dbclickFile"
             @contextmenu="contextmenuHandler">

            <!--三角标-->
            <!--<i class="menu-icon-dir" :style="{marginLeft: (level * 20) + 'px'}"-->
               <!--:class="{'hidden' : !item.hasChild, 'el-icon-caret-bottom' : item.isOpen, 'el-icon-caret-right' : !item.isOpen}"-->
               <!--@click="openOrClose"></i>-->

            <div class="fold-line-box">
                <template v-for="index in level">
                    <div class="fold-line"></div>
                </template>
            </div>

            <!--图标-->
            <!--<i v-if="item.fileType == fileTypeEnum.DIR" class="menu-icon" :class="{'el-icon-folder-opened' : item.isOpen, 'el-icon-folder' : !item.isOpen}"></i>-->
            <i v-if="item.fileType == fileTypeEnum.DIR" class="menu-icon el-icon-caret-right" :class="{'active' : item.isOpen}" @click="openOrClose"></i>
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

            <!--名称-->
            <div v-if="renameStatus" class="menu-title">
                <input v-model="newTitle"
                       v-focus="renameStatus"
                       @blur="submitRename"
                       @keyup.enter="submitRename"
                       @click.stop="doNothing"
                       @dblclick.stop="doNothing"
                       @contextmenu.stop="doNothing"></input>
            </div>
            <div v-else class="menu-title">{{item.title}}</div>
            <i v-show="item.loading" class="el-icon-loading"></i>

        </div>

        <div class="tree-menu-item-children" v-show="item.isOpen">
            <template v-for="(it, i) in item.children" :index="i.toString()">
                <TreeMenu :item="it" :index="i" :level="level + 1" :home="home"></TreeMenu>
            </template>
            <div v-show="!item.children" style="width: calc(100% - 20px);padding: 0 10px;">
                <i class="el-icon-loading" :style="{marginLeft: (level * 15) + 'px'}"></i>
            </div>
        </div>

    </div>

</template>

<script>
  import TreeMenu from '@/components/TreeMenu/TreeMenu'
  import {remote} from 'electron'
  import fileService from '@/service/FileService'

  export default {
    name: 'TreeMenu',
    components: {TreeMenu},
    props: {
      home: {
        type: Object,
        default: {}
      },
      item: {
        type: Object,
        default: {}
      },
      index: {
        type: Number,
        default: 0
      },
      level: {
        type: Number,
        default: 0
      }
    },
    data () {
      return {
        contextMenu: {
          userFolderContextMenu: {}, // 用户文件夹上下文菜单
          userFileContextMenu: {} // 用户文件上下文菜单
        },
        renameStatus: false, // 重命名状态
        newTitle: '',

        fileTypeEnum: {}
      }
    },
    created () {
      console.log(`${this.$options.name} created`)
      this.initContextMenu()
      this.fileTypeEnum = fileService.fileTypeEnum
    },
    methods: {
      doNothing () {},
      submitRename () {
        if (!this.newTitle) {
          this.$message({
            message: '名称不能为空!',
            type: 'warning',
            showClose: true
          })
          this.renameStatus = false
        } else {
          this.renameStatus = false
          this.item.title = this.newTitle
          this.$set(this.item, 'loading', true)
          fileService.renameFile(this.item).then(_ => {
            this.$set(this.item, 'loading', false)
          })
        }
      },
      clickFile () {
        this.home.clickFile(this.item)
      },
      dbclickFile () {
        if (this.item.hasChild) this.openOrClose()
        this.home.openFile(this.item)
      },
      openOrClose () {
        this.$set(this.item, 'isOpen', !this.item.isOpen)
        if (!this.item.children || this.item.children.length < 1) {
          fileService.findFiles(this.item.path).then(
            ret => {
              this.$set(this.item, 'children', ret)
            }
          )
        }
        console.log('level:', this.level)
      },
      contextmenuHandler (e) {
        console.log('contextmenuHandler', e)
        e.preventDefault()
        this.clickFile()
        if (this.item.fileType === fileService.fileTypeEnum.DIR) {
          this.contextMenu.userFolderContextMenu.popup({window: remote.getCurrentWindow()})
        } else {
          this.contextMenu.userFileContextMenu.popup({window: remote.getCurrentWindow()})
        }
      },
      initContextMenu () {
        // ==========渲染进程通过remote模块构建动态菜单==========
        let fileCommonContextMenu = [
          {
            label: '重命名',
            click: () => {
              console.log('重命名')
              this.newTitle = this.item.title
              this.renameStatus = true
            }
          },
          {
            label: '移动',
            click: () => {
              alert('todo')
            }
          },
          {
            label: '复制',
            click: () => {
              alert('todo')
            }
          },
          {
            label: '粘贴',
            click: () => {
              alert('todo')
            }
          },
          {
            label: '删除',
            click: () => {
              alert('todo')
            }
          },
          {
            label: '在系统中打开目录',
            click: () => {
              console.log('在系统中打开目录')
              this.$electron.shell.showItemInFolder(this.item.path)
            }
          }
        ]
        // 用户文件夹上下文菜单
        let userFolderContextMenuJson = [
          {
            label: '新建',
            type: 'submenu',
            submenu: [
              {
                label: '章节',
                click: () => {
                  console.log('新建 > 章节')
                  console.log('this.item:', this.item)
                  var ret = prompt('名称：')
                  console.log(ret)
                  // fileService.createFile(this.item.bookId, this.item._id, '测试', '测试内容').then(
                  //   ret => {
                  //     console.log('fileService.createFile ret', ret)
                  //   }
                  // )
                }
              },
              {
                label: '文件夹',
                click: () => {
                  console.log('新建 > 文件夹')
                  fileService.createDirectory(this.item.bookId, this.item._id, '测试文件夹').then(
                    ret => {
                      console.log('fileService.createDirectory ret', ret)
                      this.$set(this.item, 'hasChild', true)
                      fileService.updateDirectory(this.item)
                    }
                  )
                }
              },
              {type: 'separator'},
              {
                label: '人物',
                click: () => {
                  console.log('文件夹 is clicked')
                }
              },
              {
                label: '地点',
                click: () => {
                  console.log('文件夹 is clicked')
                }
              },
              {
                label: '招式',
                click: () => {
                  console.log('文件夹 is clicked')
                }
              },
              {
                label: '妖怪',
                click: () => {
                  console.log('文件夹 is clicked')
                }
              },
              {
                label: '道具',
                click: () => {
                  console.log('文件夹 is clicked')
                }
              },
              {
                label: '门派',
                click: () => {
                  console.log('文件夹 is clicked')
                }
              },
              {
                label: '大纲',
                click: () => {
                  console.log('文件夹 is clicked')
                }
              },
              {
                label: '引用',
                click: () => {
                  console.log('文件夹 is clicked')
                }
              }
            ]
          },
          {type: 'separator'},
          ...fileCommonContextMenu
        ]
        this.contextMenu.userFolderContextMenu = remote.Menu.buildFromTemplate(userFolderContextMenuJson)
        // 用户文件上下文菜单
        let userFileContextMenuJson = [
          {
            label: '打开',
            click: () => {
              console.log('文件夹 is clicked')
            }
          },
          {type: 'separator'},
          ...fileCommonContextMenu
        ]
        this.contextMenu.userFileContextMenu = remote.Menu.buildFromTemplate(userFileContextMenuJson)
        // ==========渲染进程通过remote模块构建动态菜单==========
      }
    }
  }
</script>

<style lang="less" scoped>

    @import '../../common.less';

    .tree-menu-item {
        width: 100%;
    }

    .tree-menu-item-content {
        width: calc(100% - 20px);
        padding: 0 10px;
        height: 40px;
        display: flex;
        align-items: center;
        cursor: pointer;
        .fold-line-box {
            height: 100%;
            display: flex;
            .fold-line {
                margin-left: 15px;
                height: 100%;
                border-left: 1px dotted #ccc;
            }
        }
        .menu-icon-dir {
            font-size: 14px;
            padding: 0 5px;
        }
        .menu-icon-dir.hidden {
            visibility: hidden;
        }
        .menu-icon {
            font-size: 20px;
            padding: 0 5px;
            /*font-weight: bold;*/
            transition: all 0.3s;
        }
        .menu-icon.el-icon-caret-right.active {
            transform: rotate(90deg);
        }
        .menu-title {
            /*overflow: hidden;*/
            /*text-overflow: ellipsis;*/
            white-space: nowrap;
        }
    }

    .tree-menu-item-content.active {
        background-color: @themeColor40;
    }

    .tree-menu-item-content:hover {
        background-color: @themeColor20;
    }

    .tree-menu-item-children {
        width: 100%;
    }

</style>
