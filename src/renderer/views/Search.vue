<template>

    <div class="search-box">

        <div class="search-title-line"></div>

        <div class="search-line">
            <div class="search-history-btn" @click="showHistory">
                <i class="el-icon-search"></i>
                <i class="el-icon-arrow-down"></i>
            </div>
            <input v-model="searchInfo" @input="startSearch"></input>
            <div class="search-res-info">{{result.length}}{{hasMore ? '+' : ''}} matches in {{resultFileCount}}{{hasMore ? '+' : ''}} files</div>
            <i class="close-btn el-icon-error" @click="clearSearchInfo"></i>
        </div>

        <div class="search-ope">
            <div class="search-ope-btn" @click="openFindInPage">
                <i class="el-icon-setting"></i>
            </div>
        </div>

        <div class="search-result">
            <template v-for="(item, index) in result" :index="index.toString()">
                <div class="result" :class="{'active' : item.active}"
                     @click="clickResult(item)">
                    <span class="ctx-span" v-html="item.ctx">{{item.ctx}}</span>
                    <span class="title-span">{{item.title}}</span>
                </div>
                <!--<div class="result">-->
                    <!--<span class="ctx-span">{{item.ctx}}</span>-->
                    <!--<span class="title-span">{{item.title}}</span>-->
                <!--</div>-->
            </template>
        </div>

        <div class="search-ope"></div>

        <div class="search-content">
            <MainTabs ref="MainTabs" :item="activeFile" :home="home" :searchMode="true"></MainTabs>
        </div>

        <div class="search-ope"></div>

    </div>

</template>

<script>
  // import {BrowserWindow} from 'electron'
  import MainTabs from '../components/MainTabs/MainTabs'
  import fileService from '@/service/FileService'

  import { remote } from 'electron'

  export default {
    name: 'Search',
    components: {
      MainTabs
    },
    data () {
      return {
        home: this,
        activeFile: {},
        searchInfo: '',
        workspace: '/Users/yangqi/work/myproject/electron-all-projects/workspace',
        // workspace: '/Users/yangqi/work/myproject/electron-all-projects/writeee/src',
        result: [],
        resultFileCount: 0,
        limit: 100,
        hasMore: false
      }
    },
    watch: {
      // activeFile (v) {
      //   console.log('activeFile', v)
      // }
    },
    created () {
      console.log('Search created')
    },
    methods: {
      openFindInPage () {
        console.log('findInPage', remote.getCurrentWindow().webContents.findInPage(this.searchInfo))
      },
      clickResult (item) {
        this.activeOne(item)
        this.activeFile = item
      },
      activeOne (item) {
        this.result.forEach(it => {
          it['active'] = false
        })
        item['active'] = true
      },
      startSearch () {
        console.log('stop old search')
        this.activeFile = {}
        this.hasMore = false
        this.result = []
        this.resultFileCount = 0
        console.log('start new search')
        let searchInfo = this.searchInfo
        if (!searchInfo) return
        this.search(searchInfo, this.workspace)
      },
      search (searchInfo, path) {
        fileService.findFiles(path).then(ret => {
          if (this.searchInfo !== searchInfo) {
            console.log('搜索内容改变，结束之前的搜索')
            return
          }
          ret.forEach(it => {
            if (this.result.length >= this.limit) {
              this.hasMore = true
              return
            }
            if (it.fileType === fileService.fileTypeEnum.NORMAL) {
              // ==========同步方法==========
              let data = fileService.readFileSync(it.path)
              if (this.searchInfo !== searchInfo) {
                console.log('搜索内容改变，结束之前的搜索')
                return
              }
              let regex = new RegExp(searchInfo, 'g')
              let r = regex.exec(data)
              if (r) {
                this.resultFileCount += 1
                while (r) {
                  if (this.result.length >= this.limit) {
                    this.hasMore = true
                    return
                  }
                  let ctx = data.substr((r.index - 10) < 0 ? 0 : r.index - 10, 100)
                  ctx = ctx.replace(r[0], '$searchInfo$')
                  ctx = this.encodeHtml(ctx)
                  ctx = ctx.replace('$searchInfo$', '<span style="background-color: goldenrod;">' + this.encodeHtml(r[0]) + '</span>')
                  let obj = JSON.parse(JSON.stringify(it))
                  obj.ctx = ctx
                  obj.sPos = r.index
                  obj.ePos = r.index + r[0].length
                  this.result.push(obj)
                  r = regex.exec(data)
                }
              }
              // ==========同步方法==========

              // ==========异步方法==========
              // fileService.readFile(it.path).then(data => {
              //   if (this.searchInfo !== searchInfo) {
              //     console.log('搜索内容改变，结束之前的搜索')
              //     return
              //   }
              //   let regex = new RegExp(searchInfo, 'g')
              //   let r = regex.exec(data)
              //   if (r) {
              //     this.resultFileCount += 1
              //     while (r) {
              //       if (this.result.length >= this.limit) {
              //         this.hasMore = true
              //         return
              //       }
              //       let ctx = data.substr(r.index - 10, 100)
              //       ctx = ctx.replace(r[0], '$searchInfo$')
              //       ctx = this.encodeHtml(ctx)
              //       ctx = ctx.replace('$searchInfo$', '<span style="background-color: goldenrod;">' + this.encodeHtml(r[0]) + '</span>')
              //       let obj = JSON.parse(JSON.stringify(it))
              //       obj.ctx = ctx
              //       obj.sPos = r.index
              //       obj.ePos = r.index + r[0].length
              //       this.result.push(obj)
              //       r = regex.exec(data)
              //     }
              //   }
              // })
              // ==========异步方法==========
            } else if (it.fileType === fileService.fileTypeEnum.DIR) {
              this.search(searchInfo, it.path)
            }
          })
        })
      },
      encodeHtml (html) {
        return html.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      },
      showHistory () {
        console.log('todo')
      },
      clearSearchInfo () {
        this.searchInfo = ''
        this.startSearch()
      }
    }
  }
</script>

<style lang="less" scoped>

    @import '../common.less';

    .search-box {
        width: 100%;
        height: 100%;
        background-color: #ececec;
        display: flex;
        flex-direction: column;
        align-items: center;

        .search-title-line{
            -webkit-user-select: none;
            -webkit-app-region: drag;
            width: 100%;
            height: 40px;
            background-color: #576b95;
            display: flex;
            align-items: center;
            * {
                -webkit-app-region: no-drag;
            }
        }

        .search-line {
            width: 90%;
            margin-top: 10px;
            background-color: white;
            display: flex;
            align-items: center;
            border-radius: 5px;
            padding: 0 10px;
            .search-history-btn {
                cursor: pointer;
                margin-right: 5px;
                .el-icon-arrow-down {
                    font-size: @fontSizeTinyLess;
                }
            }
            input {
                height: 20px;
                line-height: 20px;
                flex: auto;
                border: none;
                outline: none;
            }
            .search-res-info {
                cursor: default;
                font-size: @fontSizeTinyLess;
            }
            .close-btn {
                cursor: pointer;
                margin-left: 5px;
            }
        }

        .search-ope{
            width: 90%;
            display: flex;
            align-items: center;
            padding: 10px;
            .search-ope-btn{
                padding: 5px;
                border-radius: 5px;
            }
            .search-ope-btn:hover{
                background-color: #ddd;
            }
        }

        .search-result{
            width: 100%;
            height: 230px;
            background-color: white;
            overflow-y: scroll;
            .result{
                width: calc(100% - 10px);
                height: 25px;
                padding: 0 5px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                .ctx-span{
                    flex: 1;
                    white-space: nowrap;
                    overflow: hidden;
                }
                .title-span{
                    white-space: nowrap;
                    overflow: hidden;
                    padding-left: 10px;
                }
            }
            .result.active{
                background-color: #194cd1;
                color: white;
            }
        }

        .search-content{
            width: 100%;
            flex: 1;
            background-color: white;
            overflow-y: scroll;
        }
    }

</style>
