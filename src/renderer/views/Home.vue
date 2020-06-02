<template>
    <el-container style="height: 100%;">

        <el-header height="60px" style="padding: 0;">
            <div class="head-box">
                <span style="margin: 0 10px;">This version use NodeJs FS!</span>
                <el-input v-model="workspace" placeholder="当前工作空间" style="width: 200px;"></el-input>
                <el-button type="primary" icon="el-icon-circle-plus-outline" round
                           @click="openBookListDrawer">Book List
                </el-button>
                <BookList ref="bookListRef" :home="home"></BookList>
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

                        <div class="menu-inline-block">

                            <TreeMenu :item="searchResMenu" :home="home"></TreeMenu>

                            <div class="block-title">正文</div>
                            <template v-for="(item, index) in files" :index="index.toString()">
                                <TreeMenu :item="item" :index="index" :home="home"></TreeMenu>
                            </template>

                        </div>

                    </div>
                    <div class="menu-bottom">
                        <div class="menu-bottom-l">
                            <span :title="activeFile.path">{{activeFile.path}}</span>
                        </div>
                    </div>

                </div>
                <div class="resize-line" @mousedown="resizeA($event)" @dblclick="dblclickA"></div>
            </el-aside>

            <!--工作区-->
            <el-main style="padding: 0;">
                <MainTabs ref="MainTabs" :item="activeFile" :home="home"></MainTabs>
            </el-main>

        </el-container>

    </el-container>

</template>

<script>
  // import {BrowserWindow} from 'electron'
  import MainTabs from '../components/MainTabs/MainTabs'
  import TreeMenu from '@/components/TreeMenu/TreeMenu'
  // import bookService from '@/service/BookService'
  import fileService from '@/service/FileService'
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

        // bookInfo: {_id: 'kFsZeKViBAlf6NXE', name: 'loading...'},
        // activeDirectory: {},
        // activeContent: {},
        searchResMenu: fileService.sysSearchResMenu,
        // bookDirectory: [],
        // sourceMenu: fileService.sysSourceMenu,
        // directoryContent: [],

        workspace: '/Users/yangqi/work/myproject/electron-all-projects/workspace',
        // workspace: '/Users/yangqi',
        files: [],
        activeFile: {}
      }
    },
    watch: {
      // activeFile (v) {
      //   console.log('activeFile', v)
      // }
    },
    created () {
      console.log('Home created')
      this.findFiles(this.workspace)
    },
    methods: {
      findFiles (path) {
        fileService.findFiles(path).then(ret => {
          this.files = ret
        })
      },
      resizeA (e) {
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
      dblclickA () {
        this.asideWidthA = 200
      },
      openBookListDrawer () {
        this.$refs.bookListRef.open()
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
            height: calc(100% - 100px);
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
