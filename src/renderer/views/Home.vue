<template>
    <el-container style="height: 100%;">

        <el-header height="60px" style="padding: 0;">
            <div class="head-box">
                <span style="margin: 0 10px;">12345，上山打老虎</span>
                <!--<el-button @click="bigFont">+</el-button>-->
                <!--<el-button @click="smallFont">-</el-button>-->
                <el-button type="primary" icon="el-icon-circle-plus-outline" round
                           @click="openBookListDrawer">Book List
                </el-button>
                <el-button type="primary" icon="el-icon-circle-plus-outline" round
                           @click="openNewConnectionDrawer">new connection
                </el-button>
                <el-button @click="notification">notification</el-button>
                <el-button @click="test">test</el-button>
                <div style="width: 100px;height:50px;background-color: white;float:right;margin: 0 5px;"
                     @drop="onDropEvt"
                     @dragover="onDragoverEvt">{{filesDrop}}
                </div>
                <BookList ref="bookListRef" :home="home"></BookList>
                <NewConnectionForm ref="newConnectionFormRef"></NewConnectionForm>
            </div>
        </el-header>

        <el-container>
            <!--主目录-->
            <el-aside class="resize-x" :width="asideWidthA + 'px'">
                <div class="left-menu">

                    <div class="menu-top">
                        <el-dropdown>
                            <el-button type="text" icon="el-icon-circle-plus-outline">
                                新建<i class="el-icon-caret-bottom"></i>
                            </el-button>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item>章节</el-dropdown-item>
                                <el-dropdown-item>文件夹</el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </div>
                    <div class="menu-content">

                        <div class="menu-block border-top-none">
                            <div class="book-name">{{bookInfo.name}}</div>
                            <div class="book-info">ID:{{bookInfo._id}}</div>
                        </div>

                        <div class="menu-block">
                            <TreeMenu :item="searchResMenu" :home="home"></TreeMenu>
                        </div>

                        <div class="menu-block">
                            <div class="block-title">正文</div>
                            <template v-for="(item, index) in bookDirectory" :index="index.toString()">
                                <TreeMenu :item="item" :index="index" :home="home"></TreeMenu>
                            </template>
                        </div>

                        <div class="menu-block">
                            <div class="block-title">素材</div>
                            <template v-for="(item, index) in sourceMenu" :index="index.toString()">
                                <TreeMenu :item="item" :index="index" :home="home"></TreeMenu>
                            </template>
                        </div>

                    </div>
                    <div class="menu-bottom"></div>

                </div>
                <div class="resize-line" @mousedown="resizeA($event)" @dblclick="dblclickA"></div>
            </el-aside>

            <!--次目录-->
            <el-aside class="resize-x" :width="asideWidthB + 'px'">
                <div class="left-menu">
                    <div class="menu-top">
                        <el-button icon="el-icon-back" size="mini" title="返回上一级"></el-button>
                        <span class="active-directory-title">{{activeDirectory.title}}</span>
                        <el-button icon="el-icon-s-operation" size="mini"></el-button>
                    </div>
                    <div class="menu-content">

                        <template v-for="(item, index) in directoryContent" :index="index.toString()">
                            <ListMenu :item="item" :index="index" :home="home"></ListMenu>
                        </template>

                    </div>
                    <div class="menu-bottom">
                        <div class="menu-bottom-l">
                            <span>总共有 {{directoryContent.length}} 项</span>
                        </div>
                        <div class="menu-bottom-m"></div>
                        <div class="menu-bottom-r"></div>
                    </div>
                </div>
                <div class="resize-line" @mousedown="resizeB($event)" @dblclick="dblclickB"></div>
            </el-aside>

            <el-main style="padding: 0;">
                <MainTabs ref="MainTabs" :item="activeContent" :home="home"></MainTabs>
            </el-main>
        </el-container>


    </el-container>

</template>

<script>
  import {BrowserWindow} from 'electron'
  import NewConnectionForm from '../components/NewConnectionForm'
  import MainTabs from '../components/MainTabs/MainTabs'
  import TreeMenu from '@/components/TreeMenu/TreeMenu'
  import ListMenu from '@/components/ListMenu/ListMenu'
  import bookService from '@/service/BookService'
  import fileService from '@/service/FileService'
  import BookList from '@/components/BookList/BookList'

  export default {
    name: 'Home',
    components: {
      BookList,
      NewConnectionForm,
      MainTabs,
      TreeMenu,
      ListMenu
    },
    data () {
      return {
        home: this,
        filesDrop: '文件拖放测试',
        asideWidthA: 200,
        asideWidthB: 200,

        bookInfo: {_id: 'kFsZeKViBAlf6NXE', name: 'loading...'},
        activeDirectory: {},
        activeContent: {},
        searchResMenu: fileService.sysSearchResMenu,
        bookDirectory: [],
        sourceMenu: fileService.sysSourceMenu,
        directoryContent: []
      }
    },
    watch: {
      activeDirectory (v) {
        console.log('activeDirectory', v)
        this.findDirectoryContent()
      }
    },
    created () {
      console.log('Home created')
      this.findBookInfo()
    },
    methods: {
      findBookInfo () {
        bookService.findOneById(this.bookInfo._id).then(
          ret => {
            console.log('findOneById ret', ret)
            this.bookInfo = ret
          }
        )
        fileService.findDirectoryList(this.bookInfo._id).then(
          ret => {
            console.log('fileService.findDirectoryList ret', ret)
            this.bookDirectory = ret
          }
        )
      },
      findDirectoryContent () {
        fileService.findList(this.bookInfo._id, this.activeDirectory._id).then(
          ret => {
            console.log('fileService.findList ret', ret)
            this.directoryContent = ret
          }
        )
      },
      resizeA (e) {
        let ox = e.clientX
        let maxWidth = document.documentElement.clientWidth
        document.onmousemove = (e) => {
          let nx = e.clientX
          let offset = nx - ox
          ox = nx
          let w = this.asideWidthA + offset
          if (w >= 200 && maxWidth - w - this.asideWidthB >= 200) {
            this.asideWidthA = w
          }
        }
        document.onmouseup = (e) => {
          document.onmousemove = null
          document.onmouseup = null
        }
      },
      resizeB (e) {
        let ox = e.clientX
        let maxWidth = document.documentElement.clientWidth
        document.onmousemove = (e) => {
          let nx = e.clientX
          let offset = nx - ox
          ox = nx
          let w = this.asideWidthB + offset
          if (w >= 200 && maxWidth - w - this.asideWidthA >= 200) {
            this.asideWidthB = w
          }
        }
        document.onmouseup = (e) => {
          document.onmousemove = null
          document.onmouseup = null
        }
      },
      dblclickA () {
        this.asideWidthA = 200
      },
      dblclickB () {
        this.asideWidthB = 200
      },
      test () {
        let win = new BrowserWindow({width: 300, height: 300, frame: false})
        win.show()
      },
      notification () {
        let option = {
          title: '标题',
          subtitle: '副标题',
          silent: true, // 静音
          body: '通知正文内容'
        }
        // 弹出通知
        let notification = new Notification(option.title, option)
        // 当通知被点击时触发一个事件
        notification.onclick = () => {
          console.log('通知被点击')
        }
      },
      onDropEvt (e) {
        e.preventDefault() // 取消事件的默认动作
        e.stopPropagation()
        let paths = ''
        for (const f of e.dataTransfer.files) {
          console.log('File(s) you dragged here: ', f.path)
          paths += f.path
        }
        this.filesDrop = paths
      },
      onDragoverEvt (e) {
        e.preventDefault() // 取消事件的默认动作
        e.stopPropagation()
      },
      openBookListDrawer () {
        this.$refs.bookListRef.open()
      },
      openNewConnectionDrawer () {
        this.$refs.newConnectionFormRef.open()
      },
      closeConnection (index) {
        console.log('closeConnection', index)
      },
      deleteConnection (index) {
        console.log('deleteConnection', index)
      },
      editConnection (index) {
        console.log('editConnection', index)
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
            height: 69px;
            padding: 0 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            align-items: center;
            justify-content: space-between;
            .active-directory-title{
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
        .menu-content {
            width: 100%;
            height: calc(100% - 100px);
            overflow: scroll;
        }
        .menu-bottom {
            width: calc(100% - 40px);
            height: 29px;
            padding: 0 20px;
            border-top: 1px solid #eee;
            display: flex;
            font-size: @fontSizeTiny;
            color: @wxColorGray;
            align-items: center;
            justify-content: space-between;
            .menu-bottom-l {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .menu-bottom-m {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .menu-bottom-r {
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
    }

    .book-info {
        display: flex;
        align-items: center;
        /*justify-content: center;*/
        padding: 10px;
        -webkit-user-select: text;
    }

    .book-name {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px;
        -webkit-user-select: text;
    }

    .book-name::before {
        content: '《';
    }

    .book-name::after {
        content: '》';
    }

    .menu-block {
        padding: 5px 0;
        border-top: 1px solid #eee;
        .block-title {
            width: 100%;
            padding: 4px 10px;
            font-size: @fontSizeMicro;
            color: @wxColorGray;
        }
    }

</style>
