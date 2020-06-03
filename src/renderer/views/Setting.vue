<template>

    <div>123</div>

</template>

<script>
  // import {BrowserWindow} from 'electron'
  import MainTabs from '../components/MainTabs/MainTabs'
  import TreeMenu from '@/components/TreeMenu/TreeMenu'
  // import bookService from '@/service/BookService'
  // import fileService from '@/service/FileService'
  // import systemService from '@/service/SystemService'
  import BookList from '@/components/BookList/BookList'

  export default {
    name: 'Setting',
    components: {
      BookList,
      MainTabs,
      TreeMenu
    },
    data () {
      return {
      }
    },
    watch: {
      // activeFile (v) {
      //   console.log('activeFile', v)
      // }
    },
    created () {
      console.log('Setting created')
    },
    methods: {
    }
  }
</script>

<style lang="less" scoped>

    @import '../common.less';

</style>
