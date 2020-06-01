<template>
    <el-drawer
            title="New redis connection"
            :visible.sync="visible"
            :show-close="false"
            :with-header="false"
            size="500px"
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
                            <!--<el-button size="small" type="primary" round :loading="testBtnLoading"-->
                            <!--@click="connectionTest">connection test-->
                            <!--</el-button>-->
                        </el-col>
                        <el-col style="text-align: right;">
                            <el-button-group>
                                <el-button size="small" @click="close">Cancel</el-button>
                                <el-button size="small" type="primary" @click="submitForm" :loading="loading">Submit
                                </el-button>
                            </el-button-group>
                        </el-col>
                    </el-row>
                </el-form-item>

            </el-form>

            <div class="split-line"></div>

            <el-form :model="formDb" ref="formDbRef" label-width="80px" size="medium">

                <el-form-item label="条件{}">
                    <el-input type="textarea" v-model="formDb.condition"
                              placeholder="更新删除条件 {_id: '1'} \n查询条件 {name: {$in: ['tom', 'jerry']}}"></el-input>
                </el-form-item>

                <el-form-item label="对象{}">
                    <el-input type="textarea" v-model="formDb.obj" placeholder="{name: 'tom'}"></el-input>
                </el-form-item>

                <el-form-item label="结果">
                    <textarea style="white-space: nowrap;width: 100%;" v-model="formDb.result" placeholder="result" rows="10"></textarea>
                    <!--<el-input class="ttt" type="textarea" v-model="formDb.result" placeholder="result" rows="10"></el-input>-->
                </el-form-item>

                <el-form-item>
                    <el-button-group>
                        <el-button size="small" @click="insertDb">增加</el-button>
                        <el-button size="small" @click="deleteDb">删除</el-button>
                        <el-button size="small" @click="updateDb">更新</el-button>
                        <el-button size="small" @click="queryDb">查询</el-button>
                    </el-button-group>
                </el-form-item>

            </el-form>

        </div>

    </el-drawer>
</template>

<script>
  // import redis from 'redis'

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
            {required: true, message: 'name is required', trigger: 'blur'},
            {max: 20, message: 'max length 20', trigger: 'blur'}
          ],
          host: [
            {required: true, message: 'host is required', trigger: 'blur'}
          ],
          port: [
            {required: true, message: 'port is required', trigger: 'blur'}
          ]
        },
        loading: false,
        formDb: {
          condition: '{}',
          obj: '{}',
          result: ''
        }
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
      insertDb () {
        let obj = this.formDb.obj ? JSON.parse(this.formDb.obj) : {}
        this.$db.insert(obj, (err, ret) => {
          console.log('err: ', err)
          console.log('ret: ', ret)
          this.formDb.result = JSON.stringify(ret)
          this.$message({
            message: 'Success!',
            type: 'success',
            showClose: true
          })
        })
      },
      deleteDb () {
        let condition = this.formDb.condition ? JSON.parse(this.formDb.condition) : {}
        this.$db.remove(condition, {multi: true}, (err, ret) => {
          console.log('err: ', err)
          console.log('ret: ', ret)
          this.formDb.result = JSON.stringify(ret)
          this.$message({
            message: 'Success!',
            type: 'success',
            showClose: true
          })
        })
      },
      updateDb () {
        let condition = this.formDb.condition ? JSON.parse(this.formDb.condition) : {}
        let obj = this.formDb.obj ? JSON.parse(this.formDb.obj) : {}
        this.$db.update(condition, obj, {multi: true}, (err, ret) => {
          console.log('err: ', err)
          console.log('ret: ', ret)
          this.formDb.result = JSON.stringify(ret)
          this.$message({
            message: 'Success!',
            type: 'success',
            showClose: true
          })
        })
      },
      queryDb () {
        let condition = this.formDb.condition ? JSON.parse(this.formDb.condition) : {}
        this.$db.find(condition).sort({_id: -1}).exec((err, ret) => {
          console.log('err: ', err)
          console.log('ret: ', ret)
          let result = ''
          ret.forEach(it => {
            result += JSON.stringify(it) + '\n'
          })
          result += '总共：' + ret.length + '条记录'
          this.formDb.result = result
          this.$message({
            message: 'Success!',
            type: 'success',
            showClose: true
          })
        })
      }
    }
  }
</script>

<style scoped lang="less">
    .common-drawer-content {
        padding: 60px 10px 10px 10px;
        width: 100%;
        height: 100%;
        background-color: deepskyblue;
    }

    .split-line {
        border-bottom: 1px solid #ddd;
        margin: 10px 0;
    }

</style>
