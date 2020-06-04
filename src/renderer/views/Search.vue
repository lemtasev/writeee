<template>

    <div class="search-box">

        <div class="search-title-line"></div>

        <div class="search-line">
            <div class="search-history-btn" @click="showHistory">
                <i class="el-icon-search"></i>
                <i class="el-icon-arrow-down"></i>
            </div>
            <input v-model="searchInfo" @input="startSearch"></input>
            <div class="search-res-info">{{result.length}} matches in {{resultFileCount}} files</div>
            <i class="close-btn el-icon-error" @click="clearSearchInfo"></i>
        </div>

        <div class="search-ope"></div>

        <div class="search-result">
            <template v-for="(item, index) in result" :index="index.toString()">
                <div class="result">
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

    </div>

</template>

<script>
  // import {BrowserWindow} from 'electron'
  // import MainTabs from '../components/MainTabs/MainTabs'
  import fileService from '@/service/FileService'

  export default {
    name: 'Search',
    components: {},
    data () {
      return {
        searchInfo: '',
        // workspace: '/Users/yangqi/work/myproject/electron-all-projects/workspace',
        workspace: '/Users/yangqi/work/myproject/electron-all-projects/writeee/src',
        result: [],
        resultFileCount: 0
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
      startSearch () {
        console.log('stop old search')
        console.log('start new search')
        this.result = []
        this.resultFileCount = 0
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
            if (it.fileType === fileService.fileTypeEnum.NORMAL) {
              fileService.readFile(it.path).then(data => {
                if (this.searchInfo !== searchInfo) {
                  console.log('搜索内容改变，结束之前的搜索')
                  return
                }
                let regex = new RegExp(searchInfo, 'g')
                let r = regex.exec(data)
                if (r) {
                  this.resultFileCount += 1
                  while (r) {
                    let ctx = data.substr(r.index - 10, 100)
                    ctx = ctx.replace(r[0], '$searchInfo$')
                    ctx = this.encodeHtml(ctx)
                    ctx = ctx.replace('$searchInfo$', '<span style="background-color: goldenrod;">' + this.encodeHtml(r[0]) + '</span>')
                    let obj = JSON.parse(JSON.stringify(it))
                    obj.ctx = ctx
                    this.result.push(obj)
                    r = regex.exec(data)
                  }
                }
              })
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
            margin-top: 10px;
            display: flex;
            align-items: center;
            padding: 0 10px;
        }

        .search-result{
            width: calc(100% - 10px);
            padding: 5px;
            height: 230px;
            background-color: white;
            overflow-y: scroll;
            .result{
                width: 100%;
                display: flex;
                position: relative;
                .ctx-span{
                    max-width: 80%;
                    height: 25px;
                    white-space: nowrap;
                    overflow: hidden;
                }
                .title-span{
                    max-width: 80%;
                    height: 25px;
                    white-space: nowrap;
                    overflow: hidden;
                    position: absolute;
                    right: 0;
                    top: 0;
                    background-color: white;
                    padding-left: 10px;
                }
            }
        }
    }

</style>
