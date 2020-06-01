<template>
    <el-drawer
            title="New redis connection"
            :visible.sync="visible"
            :show-close="false"
            :with-header="false"
            size="300"
            direction="rtl">

        <div class="common-drawer-content">

            <el-form :model="form" :rules="rules" ref="connectionForm" label-width="80px" size="medium">

                <el-form-item label="name" prop="name">
                    <el-input v-model="form.name" placeholder="Connection name"
                              maxlength="20" show-word-limit></el-input>
                </el-form-item>

                <el-form-item label="address">
                    <el-col :span="16">
                        <el-form-item prop="host">
                            <el-input v-model="form.host" placeholder="127.0.0.1"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="2" style="text-align: center">:</el-col>
                    <el-col :span="6">
                        <el-form-item prop="port">
                            <el-input v-model="form.port" placeholder="6379" type="number"></el-input>
                        </el-form-item>
                    </el-col>
                </el-form-item>

                <el-form-item label="password">
                    <el-input v-model="form.password" placeholder="Your redis server auth" show-password></el-input>
                </el-form-item>

                <el-form-item label="remark">
                    <el-input type="textarea" v-model="form.remark" placeholder="Remarksssssss"></el-input>
                </el-form-item>

                <el-form-item>
                    <el-row type="flex" justify="space-between">
                        <el-col>
                            <el-button size="small" type="primary" round :loading="testBtnLoading" @click="connectionTest">connection test</el-button>
                        </el-col>
                        <el-col style="text-align: right;">
                            <el-button-group>
                                <el-button size="small" @click="close">Cancel</el-button>
                                <el-button size="small" type="primary" @click="submitForm" :loading="loading">Submit</el-button>
                            </el-button-group>
                        </el-col>
                    </el-row>
                </el-form-item>

            </el-form>

        </div>

    </el-drawer>
</template>

<script>
  import redis from 'redis'

  export default {
    name: 'NewConnectionForm',
    data () {
      return {
        myPromise: Promise.resolve(),
        client: null,
        visible: false,
        testBtnLoading: false,
        form: {
          name: '',
          host: '122.51.41.117',
          port: 6379,
          password: 'Yq52717!!',
          remark: ''
        },
        rules: {
          name: [
            { required: true, message: 'name is required', trigger: 'blur' },
            { max: 20, message: 'max length 20', trigger: 'blur' }
          ],
          host: [
            {required: true, message: 'host is required', trigger: 'blur'}
          ],
          port: [
            {required: true, message: 'port is required', trigger: 'blur'}
          ]
        },
        loading: false
      }
    },
    methods: {
      open () {
        this.visible = true
      },
      close () {
        this.visible = false
        this.$refs.connectionForm.resetFields()
      },
      submitForm () {
        console.log('click submitForm')
        this.$refs.connectionForm.validate((valid, res) => {
          if (!valid) {
            console.log(res)
            this.$message({
              message: 'Check your form!',
              type: 'warning',
              showClose: true
            })
            return
          }
          let doc = this.form
          this.loading = true
          this.$db.insert(doc, (err, newDoc) => {
            console.log('err: ', err)
            console.log('newDoc: ', newDoc)
            this.loading = false
            this.close()
            this.$message({
              message: 'Success!',
              type: 'success',
              showClose: true
            })
          })
        })
      },
      connectionTest () {
        console.log('connectionTest')
        this.testBtnLoading = true

        this.client = redis.createClient(this.form.port, this.form.host)
        if (this.form.password) this.client.auth(this.form.password)

        this.client.on('connect', res => {
          console.log('connect', res)
        })

        this.client.on('reconnecting', res => {
          console.log('reconnecting', res)
        })

        this.client.on('ready', res => {
          console.log('ready', res)
          this.$message({
            message: 'success',
            type: 'success',
            showClose: true
          })
          this.client.quit()
          this.testBtnLoading = false
        })

        this.client.on('error', res => {
          console.log('error', res)
          // 此处是一个坑，由于error事件可能被频繁调用，几乎同时触发多次，
          // 导致DOM来不及刷新，布局错误，
          // 可以采用Promise或者setTimeout解决
          // setTimeout(() => {
          //   this.$message({
          //     message: res,
          //     type: 'error',
          //     showClose: true
          //   })
          // }, 0)
          this.myPromise = this.myPromise.then(() => {
            this.$message({
              message: res,
              type: 'error',
              showClose: true
            })
          })
          this.testBtnLoading = false
        })

        this.client.on('warning', res => {
          console.log('warning', res)
        })

        this.client.on('end', res => {
          console.log('end', res)
        })
      }
    }
  }
</script>

<style scoped>
    .common-drawer-content{
        padding: 10px;
        width: 100%;
        height: 100%;
        background-color: deepskyblue;
    }
</style>
