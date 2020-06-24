<template>
    <el-drawer
            title="Book List"
            :visible.sync="visible"
            :show-close="false"
            :with-header="false"
            size="500px"
            direction="ltr">

        <div class="common-drawer-content">

            <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" size="medium">

                <el-form-item label="书名" prop="name">
                    <el-input v-model="form.name" placeholder="王二历险记" maxlength="20" show-word-limit></el-input>
                </el-form-item>

                <el-form-item label="作者" prop="author">
                    <el-input v-model="form.author" placeholder="王二" maxlength="20" show-word-limit></el-input>
                </el-form-item>

                <el-form-item label="描述">
                    <el-input type="textarea" v-model="form.description"
                              placeholder="Description"></el-input>
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

            <el-table :data="books" border stripe style="width: 100%;" height="50%">
                <el-table-column prop="name" label="书名"></el-table-column>
                <el-table-column prop="author" label="作者"></el-table-column>
                <el-table-column prop="description" label="描述"></el-table-column>
                <el-table-column label="操作" fixed="right" width="200">
                    <template slot-scope="scope">
                        <el-button
                                size="mini"
                                @click="chooseThisBook(scope.$index, scope.row)">选择</el-button>
                        <el-button
                                size="mini"
                                type="danger"
                                @click="deleteThisBook(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

        </div>

    </el-drawer>
</template>

<script>
  // import redis from 'redis'
  import bookService from '@/service/BookService'
  import fileService from '@/service/FileService'

  export default {
    name: 'BookList',
    props: {
      home: {
        type: Object,
        default: {}
      }
    },
    data () {
      return {
        visible: false,
        form: {
          name: '',
          author: '',
          description: ''
        },
        rules: {
          name: [
            {required: true, message: 'name is required', trigger: 'blur'},
            {max: 20, message: 'max length 20', trigger: 'blur'}
          ],
          author: [
            {required: true, message: 'author is required', trigger: 'blur'},
            {max: 20, message: 'max length 20', trigger: 'blur'}
          ]
        },
        loading: false,
        books: []
      }
    },
    created () {
      console.log(`${this.$options.name} created`)
    },
    methods: {
      chooseThisBook (index, item) {
        this.home.bookInfo._id = item._id
        this.home.findBookInfo()
        this.close()
      },
      deleteThisBook (index, item) {
        alert('todo')
      },
      getList () {
        bookService.findList().then(ret => {
          console.log('bookService.findList ret', ret)
          this.books = ret
          this.$forceUpdate()
        })
      },
      open () {
        this.visible = true
        this.getList()
      },
      close () {
        this.visible = false
        this.$refs.formRef.resetFields()
      },
      submitForm () {
        console.log('click submitForm')
        this.$refs.formRef.validate((valid, res) => {
          if (!valid) {
            console.log(res)
            this.$message({
              message: 'Check your form!',
              type: 'warning',
              showClose: true
            })
            return
          }
          this.loading = true

          bookService.save(this.form).then(ret => {
            let bookId = ret._id
            fileService.initDefault(bookId)
            this.loading = false
            // this.close()
            this.getList()
            this.$forceUpdate()
            this.$message({
              message: 'Success!',
              type: 'success',
              showClose: true
            })
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
        overflow-y: scroll;
    }

    .split-line {
        border-bottom: 1px solid #ddd;
        margin: 10px 0;
    }

</style>
