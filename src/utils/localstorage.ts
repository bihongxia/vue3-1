  
  export function saveObjArr(name:string, data:any) {
    // localStorage 存储数组对象的方法
    localStorage.setItem(name, JSON.stringify(data));
  }
  
  export function getObjArr(name:string) {
    // localStorage 获取数组对象的方法
    const res = window.localStorage.getItem(name);
    if (res && res !== 'undefined') {
      return JSON.parse(res);
    }
    return false;
  }
  
  export function clearLocalStorage(name:string) {
    localStorage.removeItem(name);
  }