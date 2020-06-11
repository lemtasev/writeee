<template>
    <div class="main-box">

        <div class="main-tabbar">
            <template v-for="(it, i) in activeFileList" :index="i.toString()">
                <div class="main-tabbar-li" :class="{'active' : it.active}" @click="clickTabbar(i)">
                <!--<div class="main-tabbar-li" :class="{'active' : i === home.activeFileListIndex}" @click="clickTabbar(i)">-->
                    <div class="left">
                        <span>{{it.title}}</span>
                        <i v-show="it.modified" class="modified-flag"></i>
                        <i v-show="it.loading" class="el-icon-loading"></i>
                    </div>
                    <div class="right">
                        <i class="el-icon-close" @click.stop="closeTab(i)"></i>
                    </div>
                </div>
            </template>
        </div>

        <div class="main-container">

            <MonacoEditor ref="MonacoEditor" :home="home" :item="activeFile"></MonacoEditor>

        </div>

    </div>
</template>

<script>
  import MonacoEditor from '@/components/MonacoEditor/MonacoEditor'

  export default {
    name: 'MainTabs',
    components: {MonacoEditor},
    props: {
      home: {
        type: Object,
        default: {}
      },
      activeFileList: {
        type: Array,
        default: []
      },
      activeFile: {
        type: Object,
        default: {}
      }
    },
    data () {
      return {}
    },
    watch: {},
    methods: {
      clickTabbar (i) {
        this.home.clickFile(this.activeFileList[i])
      },
      closeTab (i) {
        this.home.closeFile(i)
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

        .main-tabbar {
            width: 100%;
            height: 34px;
            display: flex;
            background-color: #eee;
            overflow-x: scroll;
            .main-tabbar-li {
                min-width: 120px;
                padding: 0 10px;
                height: 34px;
                line-height: 34px;
                cursor: default;
                display: flex;
                align-items: center;
                justify-content: space-between;
                .left{
                    display: flex;
                    align-items: center;
                }
                .right{
                    display: flex;
                    align-items: center;
                }
                .modified-flag {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background-color: #09bb07;
                    margin: 0 5px;
                }
            }
            .main-tabbar-li.active {
                background-color: white;
            }
        }
        .main-container {
            width: 100%;
            height: calc(100% - 34px);
        }
    }

</style>
