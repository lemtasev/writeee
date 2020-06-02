<template>

    <div class="tree-menu-item">
        <div class="tree-menu-item-content" :class="{'active' : item.path === home.activeFile.path}" :title="item.title"
             @click="clickFile"
             @dblclick="dbclickFile"
             @contextmenu="contextmenuHandler">

            <!--三角标-->
            <i class="menu-icon-dir" :style="{marginLeft: level * 20 + 'px'}"
               :class="{'hidden' : !item.hasChild, 'el-icon-caret-bottom' : item.isOpen, 'el-icon-caret-right' : !item.isOpen}"
               @click="openOrClose"></i>

            <!--图标-->
            <i v-if="item.fileType == 'directory'" class="menu-icon"
               :class="{'el-icon-folder-opened' : item.isOpen, 'el-icon-folder' : !item.isOpen}"></i>
            <i v-else-if="item.fileType == 'normal'" class="menu-icon el-icon-document"></i>

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
            <div v-show="!item.children || item.children.length == 0" style="width: 100%;text-align: center;">
                <i class="el-icon-loading"></i>
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
          sysSearchResMenuContextMenu: {}, // 搜索结果上下文菜单
          sysOutlineMenuContextMenu: {}, // 大纲上下文菜单
          sysPlaceMenuContextMenu: {}, // 地点上下文菜单
          sysCharacterMenuContextMenu: {}, // 人物上下文菜单
          sysSectMenuContextMenu: {}, // 门派上下文菜单
          sysPropsMenuContextMenu: {}, // 道具上下文菜单
          sysMonsterMenuContextMenu: {}, // 妖怪上下文菜单
          sysSkillMenuContextMenu: {}, // 招式上下文菜单
          sysReferenceMenuContextMenu: {}, // 引用上下文菜单

          userFolderContextMenu: {}, // 用户文件夹上下文菜单
          userFileContextMenu: {} // 用户文件上下文菜单
        },
        renameStatus: false, // 重命名状态
        newTitle: ''
      }
    },
    created () {
      this.initContextMenu()
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
        this.home.activeFile = this.item
      },
      refreshDirectoryContent () {
        this.home.findDirectoryContent()
      },
      dbclickFile () {
        if (this.item.hasChild) this.openOrClose()
        this.clickFile()
      },
      openOrClose () {
        this.$set(this.item, 'isOpen', !this.item.isOpen)
        // this.item.isOpen = !this.item.isOpen
        // this.$forceUpdate()
        if (!this.item.children || this.item.children.length < 1) {
          fileService.findFiles(this.item.path).then(
            ret => {
              this.$set(this.item, 'children', ret)
              // this.item.children = ret
              // this.$forceUpdate()
            }
          )
        }
        console.log('level:', this.level)
      },
      contextmenuHandler (e) {
        console.log('contextmenuHandler', e)
        e.preventDefault()
        this.clickFile()
        if (this.item.type === fileService.menuTypeEnum.SYSTEM) {
          switch (this.item._id) {
            case '搜索结果':
              console.log('todo: 【' + this.item._id + '】上下文菜单')
              this.contextMenu.sysSearchResMenuContextMenu.popup({window: remote.getCurrentWindow()})
              break
            case '大纲':
              console.log('todo: 【' + this.item._id + '】上下文菜单')
              this.contextMenu.sysOutlineMenuContextMenu.popup({window: remote.getCurrentWindow()})
              break
            case '地点':
              console.log('todo: 【' + this.item._id + '】上下文菜单')
              this.contextMenu.sysPlaceMenuContextMenu.popup({window: remote.getCurrentWindow()})
              break
            case '人物':
              console.log('todo: 【' + this.item._id + '】上下文菜单')
              this.contextMenu.sysCharacterMenuContextMenu.popup({window: remote.getCurrentWindow()})
              break
            case '门派':
              console.log('todo: 【' + this.item._id + '】上下文菜单')
              this.contextMenu.sysSectMenuContextMenu.popup({window: remote.getCurrentWindow()})
              break
            case '道具':
              console.log('todo: 【' + this.item._id + '】上下文菜单')
              this.contextMenu.sysPropsMenuContextMenu.popup({window: remote.getCurrentWindow()})
              break
            case '妖怪':
              console.log('todo: 【' + this.item._id + '】上下文菜单')
              this.contextMenu.sysMonsterMenuContextMenu.popup({window: remote.getCurrentWindow()})
              break
            case '招式心法':
              console.log('todo: 【' + this.item._id + '】上下文菜单')
              this.contextMenu.sysSkillMenuContextMenu.popup({window: remote.getCurrentWindow()})
              break
            case '引用':
              console.log('todo: 【' + this.item._id + '】上下文菜单')
              this.contextMenu.sysReferenceMenuContextMenu.popup({window: remote.getCurrentWindow()})
              break
          }
        } else if (this.item.type === fileService.menuTypeEnum.USER) {
          if (this.item.fileType === fileService.fileTypeEnum.DIR) {
            this.contextMenu.userFolderContextMenu.popup({window: remote.getCurrentWindow()})
          } else if (this.item.fileType === fileService.fileTypeEnum.NORMAL) {
            this.contextMenu.userFileContextMenu.popup({window: remote.getCurrentWindow()})
          }
        }
      },
      initContextMenu () {
        // ==========渲染进程通过remote模块构建动态菜单==========
        // 搜索结果上下文菜单
        let sysSearchResMenuContextMenuJson = [
          {
            label: '清空',
            click: () => {
              console.log('文件夹 is clicked')
            }
          }
        ]
        this.contextMenu.sysSearchResMenuContextMenu = remote.Menu.buildFromTemplate(sysSearchResMenuContextMenuJson)
        // 大纲上下文菜单
        let sysOutlineMenuContextMenuJson = [
          {
            label: '新增大纲',
            click: () => {
              console.log('文件夹 is clicked')
            }
          }
        ]
        this.contextMenu.sysOutlineMenuContextMenu = remote.Menu.buildFromTemplate(sysOutlineMenuContextMenuJson)
        // 地点上下文菜单
        let sysPlaceMenuContextMenuJson = [
          {
            label: '新增地点',
            click: () => {
              console.log('文件夹 is clicked')
            }
          }
        ]
        this.contextMenu.sysPlaceMenuContextMenu = remote.Menu.buildFromTemplate(sysPlaceMenuContextMenuJson)
        // 人物上下文菜单
        let sysCharacterMenuContextMenuJson = [
          {
            label: '新增人物',
            click: () => {
              console.log('文件夹 is clicked')
            }
          }
        ]
        this.contextMenu.sysCharacterMenuContextMenu = remote.Menu.buildFromTemplate(sysCharacterMenuContextMenuJson)
        // 门派上下文菜单
        let sysSectMenuContextMenuJson = [
          {
            label: '新增门派',
            click: () => {
              console.log('文件夹 is clicked')
            }
          }
        ]
        this.contextMenu.sysSectMenuContextMenu = remote.Menu.buildFromTemplate(sysSectMenuContextMenuJson)
        // 道具上下文菜单
        let sysPropsMenuContextMenuJson = [
          {
            label: '新增道具',
            click: () => {
              console.log('文件夹 is clicked')
            }
          }
        ]
        this.contextMenu.sysPropsMenuContextMenu = remote.Menu.buildFromTemplate(sysPropsMenuContextMenuJson)
        // 妖怪上下文菜单
        let sysMonsterMenuContextMenuJson = [
          {
            label: '新增妖怪',
            click: () => {
              console.log('文件夹 is clicked')
            }
          }
        ]
        this.contextMenu.sysMonsterMenuContextMenu = remote.Menu.buildFromTemplate(sysMonsterMenuContextMenuJson)
        // 招式上下文菜单
        let sysSkillMenuContextMenuJson = [
          {
            label: '新增招式',
            click: () => {
              console.log('文件夹 is clicked')
            }
          }
        ]
        this.contextMenu.sysSkillMenuContextMenu = remote.Menu.buildFromTemplate(sysSkillMenuContextMenuJson)
        // 引用上下文菜单
        let sysReferenceMenuContextMenuJson = [
          {
            label: '新增引用',
            click: () => {
              console.log('文件夹 is clicked')
            }
          }
        ]
        this.contextMenu.sysReferenceMenuContextMenu = remote.Menu.buildFromTemplate(sysReferenceMenuContextMenuJson)
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
                  console.log('this.item._id:', this.item)
                  fileService.createFile(this.item.bookId, this.item._id, '测试', '测试内容').then(
                    ret => {
                      console.log('fileService.createFile ret', ret)
                      this.refreshDirectoryContent()
                    }
                  )
                }
              },
              {
                label: '文件夹',
                click: () => {
                  console.log('新建 > 文件夹')
                  fileService.createDirectory(this.item.bookId, this.item._id, '测试文件夹').then(
                    ret => {
                      console.log('fileService.createDirectory ret', ret)
                      this.refreshDirectoryContent()
                      this.$set(this.item, 'hasChild', true)
                      // this.item.hasChild = true
                      // this.$forceUpdate()
                      fileService.updateDirectory(this.item)
                    }
                  )
                }
              }
            ]
          },
          {type: 'separator'},
          {
            label: '重命名',
            click: () => {
              console.log('重命名')
              this.newTitle = this.item.title
              this.renameStatus = true
              // this.$refs.renameTitleRef.focus()
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
          }
        ]
        this.contextMenu.userFolderContextMenu = remote.Menu.buildFromTemplate(userFolderContextMenuJson)
        // 用户文件上下文菜单
        let userFileContextMenuJson = [
          {
            label: '重命名',
            click: () => {
              console.log('重命名')
              this.newTitle = this.item.title
              this.renameStatus = true
            }
          },
          {
            label: '置顶',
            click: () => {
              console.log('文件夹 is clicked')
            }
          },
          {
            label: '取消置顶',
            click: () => {
              console.log('文件夹 is clicked')
            }
          },
          {
            label: '移动',
            click: () => {
              console.log('文件夹 is clicked')
            }
          },
          {
            label: '复制',
            click: () => {
              console.log('文件夹 is clicked')
            }
          },
          {
            label: '粘贴',
            click: () => {
              console.log('文件夹 is clicked')
            }
          },
          {
            label: '删除',
            click: () => {
              console.log('文件夹 is clicked')
            }
          },
          {type: 'separator'},
          {
            label: '在新窗口打开',
            click: () => {
              console.log('文件夹 is clicked')
            }
          }
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
        }
        .menu-title {
            /*overflow: hidden;*/
            /*text-overflow: ellipsis;*/
            white-space: nowrap;
        }
    }

    .tree-menu-item-content.active {
        background-color: rgba(0, 191, 255, 0.4);
    }

    .tree-menu-item-content:hover {
        background-color: rgba(0, 191, 255, 0.2);
    }

    .tree-menu-item-children {
        width: 100%;
    }

</style>
