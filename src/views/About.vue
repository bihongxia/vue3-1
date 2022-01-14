<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
  <h2>请选择</h2>
  <el-button v-for="(item, index) in arr" :key='index' @click="selectFun(index)">{{item}}</el-button>
  <div>您选中的了{{selectNum}}选项</div>
  <model></model>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, toRefs, watch } from 'vue'
import model from '../components/dialog.vue'
//ref方法使元素变成响应式的
export default defineComponent({
  setup(){
    interface DataProps {
      arr: string[],
      selectNum: string,
      selectFun: (index: number) => void;
    }
    const data: DataProps = reactive({
      arr: ['A', 'B', 'C'],
      selectNum: '',
      selectFun: (index: number)=>{
        data.selectNum = data.arr[index]
      }
    });
    const refData = toRefs(data)
    watch([refData.selectNum], (n, o)=>{
       document.title = n[0];
    })
    return {
      ...refData
    }
  },
  components: {
    model
  },

  // setup() {
  //   const arr = ref(['A', 'B', 'C']);
  //   const selectNum = ref('');
  //   const selectFun = (index: number) => {
  //     selectNum.value = arr.value[index];
  //   }
  //   return {
  //     arr,
  //     selectNum,
  //     selectFun,
  //   }
  // },
})
</script>

