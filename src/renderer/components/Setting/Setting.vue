<template>

    <div class="setting-box">
        <div class="setting-box-top">
            <el-button-group style="margin-right: 5%;">
                <el-button size="small" @click="cancelSetting">取消</el-button>
                <el-button size="small" type="primary" @click="confirmSetting">确定</el-button>
            </el-button-group>
        </div>
        <div class="setting-box-bottom">
            <div class="setting-nav">
                <ul>
                    <li><a href="#general">常规</a></li>
                    <li><a href="#editor">编辑器</a></li>
                    <li><a href="#editor2">编辑器2</a></li>
                    <li><a href="#editor3">编辑器3</a></li>
                    <li><a href="#editor4">编辑器4</a></li>
                    <li><a href="#editor5">编辑器5</a></li>
                    <li><a href="#editor6">编辑器6</a></li>
                    <li><a href="#editor7">编辑器7</a></li>
                    <li><a href="#editor8">编辑器8</a></li>
                </ul>
            </div>
            <div class="setting-content">
                <el-form class="setting-form" size="mini" label-position="left" label-width="auto">

                    <div class="split-line" id="general">常规</div>
                    <el-form-item>
                        <el-checkbox v-model="userSetting.general.darkTheme">黑暗主题</el-checkbox>
                    </el-form-item>
                    <el-form-item label="位置">
                        <!--<el-input placeholder="请选择或输入一个目录" v-model="workspace">-->
                            <!--<el-button slot="append" icon="el-icon-folder-opened" @click="chooseDirectory"></el-button>-->
                        <!--</el-input>-->
                    </el-form-item>

                    <div class="split-line" id="editor">编辑器</div>
                    <el-form-item label="字体大小">
                        <el-input v-model="userSetting.editor.fontSize"></el-input>
                    </el-form-item>
                    <el-form-item label="行高">
                        <el-input v-model="userSetting.editor.lineHeight"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-checkbox v-model="userSetting.editor.wordWrap">自动换行</el-checkbox>
                    </el-form-item>
                    <el-form-item>
                        <el-checkbox v-model="userSetting.editor.lineNumbers">显示段落号</el-checkbox>
                    </el-form-item>
                    <el-form-item>
                        <el-checkbox v-model="userSetting.editor.minimap">显示预览小地图</el-checkbox>
                    </el-form-item>

                    <div class="split-line" id="editor2">编辑器2</div>
                    <el-form-item>
                        <el-checkbox v-model="userSetting.editor.lineNumbers">显示段落号</el-checkbox>
                    </el-form-item>
                    <el-form-item>
                        <el-checkbox v-model="userSetting.editor.minimap">显示预览小地图</el-checkbox>
                    </el-form-item>

                    <div class="split-line" id="editor3">编辑器3</div>
                    <el-form-item>
                        <el-checkbox v-model="userSetting.editor.lineNumbers">显示段落号</el-checkbox>
                    </el-form-item>
                    <el-form-item>
                        <el-checkbox v-model="userSetting.editor.minimap">显示预览小地图</el-checkbox>
                    </el-form-item>

                    <div class="split-line" id="editor4">编辑器4</div>
                    <el-form-item>
                        <el-checkbox v-model="userSetting.editor.lineNumbers">显示段落号</el-checkbox>
                    </el-form-item>
                    <el-form-item>
                        <el-checkbox v-model="userSetting.editor.minimap">显示预览小地图</el-checkbox>
                    </el-form-item>

                    <div class="split-line" id="editor5">编辑器5</div>
                    <el-form-item>
                        <el-checkbox v-model="userSetting.editor.lineNumbers">显示段落号</el-checkbox>
                    </el-form-item>
                    <el-form-item>
                        <el-checkbox v-model="userSetting.editor.minimap">显示预览小地图</el-checkbox>
                    </el-form-item>

                    <div class="split-line" id="editor6">编辑器6</div>
                    <el-form-item>
                        <el-checkbox v-model="userSetting.editor.lineNumbers">显示段落号</el-checkbox>
                    </el-form-item>
                    <el-form-item>
                        <el-checkbox v-model="userSetting.editor.minimap">显示预览小地图</el-checkbox>
                    </el-form-item>

                    <div class="split-line" id="editor7">编辑器7</div>
                    <el-form-item>
                        <el-checkbox v-model="userSetting.editor.lineNumbers">显示段落号</el-checkbox>
                    </el-form-item>
                    <el-form-item>
                        <el-checkbox v-model="userSetting.editor.minimap">显示预览小地图</el-checkbox>
                    </el-form-item>

                    <div class="split-line" id="editor8">编辑器8</div>
                    <el-form-item>
                        <el-checkbox v-model="userSetting.editor.lineNumbers">显示段落号</el-checkbox>
                    </el-form-item>
                    <el-form-item>
                        <el-checkbox v-model="userSetting.editor.minimap">显示预览小地图</el-checkbox>
                    </el-form-item>


                </el-form>
            </div>
        </div>
    </div>

</template>

<script>
  // import redis from 'redis'
  // import bookService from '@/service/BookService'
  // import fileService from '@/service/FileService'
  import defaultSetting from '@/defaultSetting'

  export default {
    name: 'Setting',
    props: {
      home: {
        type: Object,
        default: {}
      }
    },
    data () {
      return {
        userSetting: defaultSetting
      }
    },
    beforeCreate () {
      this.userSetting = this.$electron.remote.getGlobal('sharedObject').userSetting
    },
    created () {
      console.log(`${this.$options.name} created`)
    },
    methods: {
      cancelSetting () {
        this.home.$refs.SettingRef.closeDrawer()
      },
      confirmSetting () {
        console.log(this.userSetting)
      }
    }
  }
</script>

<style scoped lang="less">

    @import '../../common.less';

    .setting-box{
        width: 100%;
        height: 100%;
        background-color: #fff;
        .setting-box-top {
            width: 100%;
            height: 60px;
            background-color: @themeColor;
            display: flex;
            align-items: center;
            justify-content: flex-end;
        }
        .setting-box-bottom {
            width: 100%;
            height: calc(100% - 60px);
            display: flex;
            .setting-nav{
                width: 200px;
                height: 100%;
                overflow-y: scroll;
                background-color: @themeColor20;
            }
            .setting-content{
                flex: auto;
                height: 100%;
                overflow-y: scroll;
                display: flex;
            }
        }
    }

    .setting-form {
        padding: 5px 5%;
        width: 90%;
    }

    .split-line {
        padding: 0 0 10px 0;
        border-bottom: 1px solid #ddd;
        margin: 20px 0;
        color: black;
        font-size: @fontSizeNormal;
    }

</style>
