<template>
    <div>
        <el-tabs v-model="activeTabName" type="card" closable @tab-remove="removeTab">

            <el-tab-pane
                    v-for="(item, index) in tabList"
                    :key="item._id"
                    :label="item.name"
                    :name="item._id">
                {{item.content}}
            </el-tab-pane>

        </el-tabs>
    </div>
</template>

<script>
  // import redis from 'redis'

  export default {
    name: 'MainTabs',
    data () {
      return {
        activeTabName: '0',
        tabList: [
          {name: 'Dashboard', _id: '0'}
        ]
      }
    },
    methods: {
      addTab (cinfo) {
        console.log('cninfo', cinfo)
        console.log('name', cinfo.name)
        console.log('host:port', cinfo.host + ':' + cinfo.port)
        // 检查是否要创建新的tab
        let has = false
        for (let i in this.tabList) {
          if (this.tabList[i]._id === cinfo._id) {
            has = true
            break
          }
        }
        if (!has) {
          this.tabList.push(cinfo)
        }
        this.activeTabName = cinfo._id
        // this.client = redis.createClient(cinfo.port, cinfo.host)
        // if (cinfo.password) this.client.auth(cinfo.password)
        //
        // this.client.on('connect', res => {
        //   console.log('connect', res)
        // })
        //
        // this.client.on('reconnecting', res => {
        //   console.log('reconnecting', res)
        // })
        //
        // this.client.on('ready', res => {
        //   console.log('ready', res)
        //   console.log('client', this.client)
        //   this.client.send_command('config', ['get', 'databases'], (err, res) => {
        //     console.log(err)
        //     console.log(res)
        //     if (res && res[1]) {
        //       console.log(res[0], '=', res[1])
        //     }
        //   })
        //   // SCAN cursor [MATCH pattern] [COUNT count]
        //   this.client.send_command('scan', ['0', 'match', '*', 'count', '20'], (err, res) => {
        //     console.log(err)
        //     console.log(res)
        //   })
        //   this.$message({
        //     message: 'success',
        //     type: 'success',
        //     showClose: true
        //   })
        // })
        //
        // this.client.on('error', res => {
        //   console.log('error', res)
        //   this.myPromise = this.myPromise.then(() => {
        //     this.$message({
        //       message: res,
        //       type: 'error',
        //       showClose: true
        //     })
        //   })
        // })
        //
        // this.client.on('warning', res => {
        //   console.log('warning', res)
        // })
        //
        // this.client.on('end', res => {
        //   console.log('end', res)
        // })
      },
      removeTab (targetName) {
        console.log('removeTab (targetName)', targetName)
        let tabs = this.tabList
        let activeName = this.activeTabName
        if (activeName === targetName) {
          tabs.forEach((tab, index) => {
            if (tab._id === targetName) {
              let nextTab = tabs[index + 1] || tabs[index - 1]
              if (nextTab) {
                activeName = nextTab._id
              }
            }
          })
        }
        this.activeTabName = activeName
        this.tabList = tabs.filter(tab => tab._id !== targetName)
      }
    }
  }
</script>

<style scoped>
</style>
