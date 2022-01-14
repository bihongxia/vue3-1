<template>
    <div class="simple-upload-container">
        <div class="total-progress">
            <div class="btns">
                <el-button-group>
                    <el-button>
                        选择文件
                        <el-icon class="el-icon--right"><UploadFilled/></el-icon>
                        <input type="file" class="select-file-input">
                    </el-button>
                    
                    <el-button>上传<el-icon class="el-icon--right"><Upload/></el-icon></el-button>
                    <el-button>暂停<el-icon class="el-icon--right"><VideoPlay/></el-icon></el-button>
                    <el-button>恢复<el-icon class="el-icon--right"><VideoPause/></el-icon></el-button>
                    <el-button>清空<el-icon class="el-icon--right"><Close/></el-icon></el-button>
                </el-button-group>
                <slot name="header"></slot>
            </div>
        </div>
        <div class="file-list">
            
        </div>

    </div>
    
</template>
<script lang="ts">
let chunkSize = 10 * 1024 * 1024; //切片大小10M
// let fileIndex = 0; //当前正在变量的文件下标
//定义接口约束后续使用
interface StatusInf{
    [propName: string]: string;
}

//所有文件状态
const Status:StatusInf = {
    wait: "wait",
    pause: "pause",
    uploading: "uploading",
    hash: "hash",
    error: "error",
    done: "done",
}

//单个文件状态
const fileStatusObj:StatusInf = {
    wait: 'wait',
    uploading: 'uploading',
    success: 'success',
    error: 'error',
    secondPass: 'secondPass',
    pause: 'pause',
    resume: 'resume',
}
//单文件状态描述
const fileStatusStrObj:StatusInf = {
    wait: '待上传',
    uploading: '上传中',
    success: '成功',
    error: '失败',
    secondPass: '秒传',
    pause: '暂停',
    resume: '恢复',
}
</script>
<script setup lang="ts">
import {ref, toRefs, reactive, computed, defineProps, onMounted} from 'vue'
import { UploadFilled, Upload, VideoPlay, VideoPause, Close } from '@element-plus/icons-vue';
import { saveObjArr, getObjArr, clearLocalStorage } from '@/utils/localstorage';
import axios, { CancelToken } from 'axios';
var instance = axios.create({});

const props = defineProps({
    headers: {
        type: Object,
        default: null
    },
    beforeUpload: {
        type: Function,
        default: null
    },
    accept: {
        type: String,
        default: ''
    },
    //上传文件时需要携带的参数
    uploadArguments: {
        type: Object,
        default: () => {
            return {}
        }
    },
    //是否传递cookie
    withCredentials: {
        type: Boolean,
        default: false
    },
    //文件个数
    limit: {
        type: Number,
        default: 0
    },
    //文件超出个数限制的钩子
    onExceed: {
        type: Function,
        default: ()=>{}
    },
    mutiple: {
        type: Boolean,
        default: false
    },
    baseUrl: {
        type: String,
        default: ''
    },
    //切片大小
    chunkSize: {
        type: Number,
        default: 10 * 1024 *1024
    },
    //上传并发数
    threads: {
        type: Number,
        default: 3
    },
    //错误重试次数
    chunkRetry: {
        type: Number,
        default: 3
    }
})

//转换上传文件的大小
function transformByte(size: number){
    if(!size) {
        return '0B'
    }
    let num = 1024.0;//byte
    if(size < num) {
        return size + 'B'
    }
    if(size < Math.pow(num, 2)){
        return (size /num).toFixed(2) + 'K'
    }
    if(size < Math.pow(num, 3)){
        return (size/Math.pow(num, 2)).toFixed(2) + 'M'
    }
    if(size < Math.pow(num, 4)){
        return (size/Math.pow(num, 3)).toFixed(2) + 'G'
    }
    return (size/Math.pow(num, 4)).toFixed(2) + 'T'
}
//单个文件状态格式化成文本
function fileStatus(status:string){
    return fileStatusStrObj[fileStatusObj[status]]

}
const data = reactive({
    uploadFiles: [],//存储files信息
    worker: null, 
    cancels: [], //存储要取消的请求
    tempTreads: 3, 
    status: Status.wait //默认状态
});
toRefs(data);

//不允许点击修改按钮
const changeDisabled = computed(() => {
    return ![Status.wait, Status.done].includes(data.status)
})

//不允许点击上传按钮
const uploadDisabled = computed(() => {
    return !data.uploadFiles.length || [Status.pause, Status.done, Status.uploading, Status.hash].includes(data.status)
})

//不允许点击暂停按钮
const pauseDisabled = computed(() => {
    return [Status.hash, Status.wait, Status.done].includes(data.status)
})

//不允许点击恢复按钮
const resumeDisabled = computed(() => {
    return ![Status.pause].includes(data.status)
})

//不允许点清空
const clearDisabled = computed(() => {
    return !data.uploadFiles.length
})

//图标的更改
const fileStatusIcon = computed((status: string) => {
    return function (status:string){
        let className  = '';
        switch (status) {
            case 'uploading':
                className = 'Loading';
                break;
            case 'success':
            case 'secondPass':
                className = 'CircleCheck';
                break;
            case 'error':
                className = 'Close';
                break;
        }   
    }
})

//
onMounted(() => {
    setAxios();
    data.tempTreads = props.threads; //并发数量
})

const setAxios = ()=>{
    if(!props.headers) return;
    for (const i in props.headers) {
        instance.defaults.headers.common[i] = props.headers[i];
      }
      // 是否携带cookie
      if (props.withCredentials) {
        instance.defaults.withCredentials = true;
      }
      // 设置baseUrl
      if (props.baseUrl) {
        instance.defaults.baseURL = props.baseUrl;
      }
      // 设置切片大小
      chunkSize = props.chunkSize;
}





</script>
<style scoped lang="scss">
.simple-upload-container {
  width: 100%;
  border: 1px solid #d2d2d2;
  border-radius: 4px;
  background-color: #fff;
  padding-bottom: 15px;
  padding: 10px;
  .progress-box {
    width: 100%;
  }
  .total-progress {
    margin-bottom: 15px;
    .btns {
      position: relative;
      .select-file-input {
        position: absolute;
        display: inline-block;
        left: 0;
        top: 0;
        border: none;
        opacity: 0;
        width: 96px;
        height: 28px;
      }
    }
  }
  .file-list {
    .list-item {
      padding: 8px 10px;
      display: flex;
      justify-content: center;
      justify-items: center;
      line-height: 25px;
      position: relative;
      &:hover .item-chunk-box {
        display: block;
      }
      div {
        flex: 1;
        margin-top: 6px;
      }
      .item-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 6px;
        .svg-icon {
          font-size: 22px;
          vertical-align: sub;
        }
      }
      .item-status {
        flex: 0 0 10%;
        text-align: center;
        text-align: left;
        .el-icon-circle-check {
          color: #67c23a;
        }
        .el-icon-circle-close {
          color: #f00;
        }
      }
      .item-chunk-box {
        display: none;
        transition: all 3s;
        position: absolute;
        top: 0;
        left: 40px;
        z-index: 10;
      }
      .item-progress {
        flex: 0 0 60%;
      }
    }
  }
  .upload-tip {
    font-size: 12px;
    color: #606266;
    margin-top: 7px;
  }
  .el-progress {
    width: 80%;
    display: inline-block;
  }
  >>> .el-collapse-item__header {
    height: auto;
  }
}
</style>
