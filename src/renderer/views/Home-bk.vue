<template>
    <el-container style="height: 100%;">
        <el-header height="60px" style="line-height: 60px;background-color: deepskyblue;">
            <el-row>
                <el-col :span="24">
                    <el-button type="primary" icon="el-icon-circle-plus-outline" round
                               @click="openNewConnectionDrawer">new connection
                    </el-button>
                    <el-button @click="notification">notification</el-button>
                    <el-button @click="test">test</el-button>
                    <div style="width: 100px;height:50px;background-color: white;float:right;margin: 0 5px;"
                         @drop="onDropEvt"
                            @dragover="onDragoverEvt">文件拖放测试</div>
                    <NewConnectionForm ref="newConnectionForm"></NewConnectionForm>
                </el-col>
            </el-row>
        </el-header>

        <el-container>
            <el-aside width="200px" style="border-right: 1px solid #ddd;">
                <!--<el-menu>-->

                    <!--<el-submenu v-for="(item, index) in servers" :index="index.toString()">-->
                        <!--<template slot="title"><i class="el-icon-message"></i>{{item.name}}</template>-->
                        <!--<el-menu-item :index="index + '0'" @click="openConnection(index)">open</el-menu-item>-->
                        <!--<el-menu-item :index="index + '1'" @click="closeConnection(index)">close</el-menu-item>-->
                        <!--<el-menu-item :index="index + '2'" @click="deleteConnection(index)">delete</el-menu-item>-->
                        <!--<el-menu-item :index="index + '3'" @click="editConnection(index)">edit</el-menu-item>-->
                    <!--</el-submenu>-->

                <!--</el-menu>-->

                <div>aside2</div>

            </el-aside>

            <el-aside width="200px" style="border-right: 1px solid #ddd;">
                <div>aside2</div>
            </el-aside>

            <el-main>
                <MainTabs ref="MainTabs"></MainTabs>
            </el-main>
        </el-container>


    </el-container>

</template>

<script>
  import { BrowserWindow } from 'electron'
  import NewConnectionForm from '../components/NewConnectionForm'
  import MainTabs from '../components/MainTabs/MainTabs'

  export default {
    name: 'Home',
    components: {
      NewConnectionForm,
      MainTabs
    },
    data () {
      return {
        myPromise: Promise.resolve(),
        client: null,
        servers: []
      }
    },
    created () {
      console.log('Home created')
      this.$db.find({}, {}, (err, res) => {
        console.log('err: ', err)
        console.log('res: ', res)
        this.servers = res
      })
    },
    methods: {
      test () {
        let win = new BrowserWindow({ width: 300, height: 300, frame: false })
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

        for (const f of e.dataTransfer.files) {
          console.log('File(s) you dragged here: ', f.path)
        }
      },
      onDragoverEvt (e) {
        e.preventDefault() // 取消事件的默认动作
        e.stopPropagation()
      },
      openNewConnectionDrawer () {
        this.$refs.newConnectionForm.visible = true
      },
      openConnection (index) {
        console.log('openConnection', index)
        var cinfo = this.servers[index]
        this.$refs.MainTabs.addTab(cinfo)
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
      // test (index) {
      //   console.log('test', index)
      //   this.client.send_command('info', (res, obj) => {
      //     console.log(res)
      //     console.log(obj)
      //   })
      // },
      // info (index) {
      //   console.log('info', index)
      //   console.log(this.client.server_info)
      // }
    }
  }
</script>

<style scoped>

</style>
