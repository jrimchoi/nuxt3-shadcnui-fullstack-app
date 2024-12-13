<script lang="ts">
const _actions = ['add', 'proc'] // <= _actions can be accessed in setup scope
export default {}
</script>

<script setup lang="ts">
//import {TreeList, createDataTree, extendDataItem, filterBy, mapTree, orderBy } from '@progress/kendo-vue-treelist';
import VCustomKTemplate from '@/gs-caltex/core/components/kendo/VCustomKTemplate.vue';
import { saveExcel } from '@progress/kendo-vue-excel-export';
import { createDataTree, extendDataItem, filterBy, mapTree, orderBy, TreeList, treeToFlat } from '@progress/kendo-vue-treelist';

interface Emit {
  (e: 'update:adaptor', value: any): void
}

interface Props {
  adaptor: any,
}

const props = defineProps<Props>()
//const emit = defineEmits<Emit>()
// const emit = defineEmits<{
//   (e: 'update:adaptor', adaptor: any): void,
//   (e: 'clickLink', event:any): void,
// }>()
const emit = defineEmits(_actions)

const dataTree = ref<any[]>()
const adaptor = ref(props.adaptor)
const toolbar = adaptor.value.toolbar
//const templateRefresh = ref(true);
const dataItem = ref();  // 4 template 
const componentKey = ref(adaptor.value.componentKey)

if(adaptor.value.subItemsField === undefined || adaptor.value.subItemsField === "") adaptor.value.subItemsField = 'subItems'
if(adaptor.value.expandField === undefined || adaptor.value.expandField === "") adaptor.value.expandField = 'expanded'
if(adaptor.value.baseField === undefined || adaptor.value.baseField === "") adaptor.value.baseField = 'id'
if(adaptor.value.parentField === undefined || adaptor.value.parentField === "") adaptor.value.parentField = 'parentId'
if(adaptor.value.expanded === undefined || adaptor.value.expanded.length === 0) adaptor.value.expanded = [1]

const DATA_ITEM_KEY = adaptor.value.baseField;
const SUB_ITEMS_FIELD = adaptor.value.subItemsField;
const EXPAND_FIELD = adaptor.value.expandField;
const SELECTED_FIELD = "selected"
const dataItemKey = DATA_ITEM_KEY
const selected:any = ref({})
const treeDataItems:any = ref([])

const sortable = ref(true) 

const headerSelectionValue = computed(() => {
  console.log("headerSelectionValue", SUB_ITEMS_FIELD)

  let allSelected = false;
  mapTree(treeDataItems.value, SUB_ITEMS_FIELD, (item) => {
    allSelected = allSelected && selected.value[item[DATA_ITEM_KEY]];
    return item;
  });
  return allSelected;
})

if(adaptor.value.columns[0].field === "selected"){
  sortable.value = false // selected 있을 경우 정렬기능은 제한한다. 전체선택 컬럼에서 문제..
  adaptor.value.columns[0].headerSelectionValue = headerSelectionValue
  //adaptor.value.columns.unshift({field: "selected", width:"4%", headerSelectionValue: headerSelectionValue});
}

console.log("adaptor.value.columns", adaptor.value.columns)

// ##### Component Life-Cycle  #######
onMounted(() => {
  console.log("onMounted templateRefresh.value ", adaptor.value._templateRefresh)
  adaptor.value._templateRefresh = true
})

onUpdated(() => {
  console.log("onUpdated templateRefresh.value ", adaptor.value._templateRefresh)
  if(adaptor.value._setDataPost){ 
    console.log("onUpdated _setDataPost")

    adaptor.value._templateRefresh = false
    adaptor.value.loader = true;
    
    setTimeout(() => {
      adaptor.value.loader = false;
      adaptor.value._templateRefresh = true  // template column refresh 
      adaptor.value._setDataPost = false

      //adaptor.value.componentKey ++
      //componentKey.value = adaptor.value.componentKey

    }, 100);

    //getData("watchEffect")
    //return
  }
})

// ####### watach && watchEffect #######
watchEffect(() => {
  if(adaptor.value._setDataPost){  // 안타고 ... 
    console.log("watchEffect _setDataPost....")
    adaptor.value._templateRefresh = false
    adaptor.value.loader = true;

    setTimeout(() => {
      adaptor.value.loader = false;
      adaptor.value._templateRefresh = true  // template column refresh 
      adaptor.value._setDataPost = false
      //console.log("VCustomKGrid getData...111111", adaptor.value.group, adaptor.value.viewData)
    }, 100);
    //getData("watchEffect")
    //return
  }
})

// ####### fuction && event #######
const toolbarAction = (e:any, action:any) => { 
  console.log("action...000", action)
  if(action.toUpperCase() === "Add".toUpperCase()){
    //addRecord()
  }
  emit(action, e)
  emit('update:adaptor', adaptor.value)
}

const getIcon = (action:string) => {
  if(action.toLowerCase().indexOf("add".toLowerCase()) >= 0) return "mdi-pen-plus"
  if(action.toLowerCase().indexOf("delete".toLowerCase()) >= 0) return "mdi-trash-can-outline"
  if(action.toLowerCase().indexOf("save".toLowerCase()) >= 0) return "mdi-content-save-edit-outline"
  
  return "mdi-calendar-cursor"
}

const rowclick = (e:any) => {
  //console.log("rowclick", e.dataItem, adaptor.value.data)
  adaptor.value.clickItem = JSON.parse(JSON.stringify(e.dataItem)) // {...e.dataItem} // 행클릭시 clickItem 담기 
  
  console.log("rowclick222", adaptor.value.clickItem )

  // 제거 
  delete adaptor.value.clickItem[adaptor.value.subItemsField]  // subItems
  
  emit("onClickRow", e, adaptor.value.clickItem)
  emit('update:adaptor', adaptor.value)
}

const clickLink = (e:any, item:any) => { // cell click --> tree --> parent
  console.log("clickLink tree-list", item)
  adaptor.value.clickItem = {...item} // 링크 클릭시 clickItem 담기 

  // 제거 
  delete adaptor.value.clickItem[adaptor.value.subItemsField]  // subItems

  emit("onClickLink", e, item)
  emit('update:adaptor', adaptor.value)
}

const handleDataStateChange =  (e:any) => {
  console.log("handleDataStateChange...", e)
  //if(e.data.field === SELECTED_FIELD) return
  
  createAppState(e.data);
}

const createAppState = (dataState:any) => {
  console.log("createAppState...")
  adaptor.value.sort = dataState.sort;
  adaptor.value.filter4Tree = dataState.filter;
}

const exportExcel = () => {
  saveExcel({
    fileName: 'myExcelFile',
    data: treeToFlat(
      adaptor.value.data,
      adaptor.value.expandField,
      adaptor.value.subItemsField
    ),
    columns: adaptor.value.columns,
    hierarchy: true,
  });
}


const processedData = computed(() => {
  adaptor.value.loader = true

  dataTree.value = createDataTree( // for flat data 
      adaptor.value._data,
      (i:any) => i[adaptor.value.baseField], //i.id,
      (i:any) => i[adaptor.value.parentField], //i.reportsTo,
      adaptor.value.subItemsField  
  )

  //console.log("processedData...", dataTree.value, selected.value)
  //console.log("processedData...filter4Tree", adaptor.value.filter4Tree)

  let filteredData = filterBy(dataTree.value, adaptor.value.filter4Tree, adaptor.value.subItemsField);
  let sortedData = orderBy(filteredData, adaptor.value.sort, adaptor.value.subItemsField);

  adaptor.value.data = sortedData
  adaptor.value.viewData = sortedData

  //adaptor.value.componentKey ++
  //componentKey.value = adaptor.value.componentKey

  return addExpandField(sortedData)
})

const addExpandField = (dataTree:any) => {
  return mapTree(dataTree, adaptor.value.subItemsField, (item) =>
    extendDataItem(item, adaptor.value.subItemsField, {
      //[adaptor.value.expandField]: adaptor.value.expanded.includes(item.id),
      [adaptor.value.expandField]: adaptor.value.expanded.includes(item[adaptor.value.baseField]),
      [SELECTED_FIELD]: selected.value[item[adaptor.value.baseField]],
    })
  )
}

const onHeaderSelectionChange = (event:any) => {
  console.log("onHeaderSelectionChange", SUB_ITEMS_FIELD)
  const checkboxElement = event.event.target;
  const checked = checkboxElement.checked;

  //console.log("onHeaderSelectionChange...", checked, adaptor.value.data)

  const newSelectedState:any = {};
  const newSelectedRows:any = [];
  mapTree(adaptor.value.data, SUB_ITEMS_FIELD, (item:any) => {
    newSelectedState[item[adaptor.value.baseField]] = checked ? true : undefined;
    //if(checked) newSelectedRows.push(item[adaptor.value.baseField])
    if(checked) newSelectedRows.push(item["uuid"])
    return item;
  });

  selected.value = newSelectedState
  adaptor.value.selectedRows = newSelectedRows
  
  //console.log("adaptor.value.selectedRows", adaptor.value.selectedRows)
}

const onSelectionChange = (e:any) => {
  //console.log("onSelectionChange...", e.event.target.checked, e.dataItem)

  selected.value = {
    ...selected.value,
    [e.dataItem[adaptor.value.baseField]]: e.event.target.checked ? true : undefined,
  };

  if(e.event.target.checked){
    //adaptor.value.selectedRows.push(e.dataItem[adaptor.value.baseField])
    adaptor.value.selectedRows.push(e.dataItem["uuid"])
  }else{
    //const index = adaptor.value.selectedRows.indexOf(e.dataItem[adaptor.value.baseField])
    const index = adaptor.value.selectedRows.indexOf(e.dataItem["uuid"])
    if (index != -1) {
      adaptor.value.selectedRows.splice(index, 1);
    }
  }
  
  if(adaptor.value.selectedRows.length > 0){
    let id = adaptor.value.selectedRows[0]
    let filterData = [...adaptor.value.data.filter((item:any) =>(item[adaptor.value.baseField] === e.dataItem[adaptor.value.baseField]))]
    if(filterData.length > 0) adaptor.value.selectedItem = filterData[0]
  }else{
    adaptor.value.selectedItem = {}
  }

  // check여부 상관없이 행을 클릭한것으로 간주
  adaptor.value.clickItem = e.dataItem // 행클릭시 clickItem 담기 

  //console.log("onSelectionChange...1", adaptor.value.selectedItem)
  //console.log("onSelectionChange...2", adaptor.value.selectedRows)
  /////adaptor.value.clickItem = e.dataItem // 행클릭시 clickItem 담기 
}

const onExpandChange = (e:any) => {
  //console.log("onExpandChange", e.dataItem.id, e.value)
  
  adaptor.value.expanded = e.value
  ? adaptor.value.expanded.filter((id:any) => id !== e.dataItem.id)
  : [...adaptor.value.expanded, e.dataItem.id];
}

const treeListWidth = ref(null)
const onColumnResize = (e:any) => {
  //treeListWidth.value = e.totalWidth
  //console.log("aaaaaaaaa", e.totalWidth, e.columns)
  if (e.end) {
    adaptor.value.columns = e.columns
  }
}

const treeListStyles = computed(() => {
  return {
    height: adaptor.height === 0 ? '680px' : adaptor.value.height + 'px',
    overflow: "auto",
    //display: "block",
    width: treeListWidth.value ? treeListWidth.value + 'px' : treeListWidth.value
  }
})

const handleSortChange = (e:any) => {
  //console.log("handleSortChange", e.dataItem.id, e.value)
  adaptor.value.sort = e.sort;
}

</script>

<!-- kendo grid column template : check -->
<template >
  <div class="custom-tree-list-0000">
    <!-- :style="{height: adaptor.height === 0 ? '680px' : adaptor.height + 'px', overflow: 'auto', }" -->
    <TreeList 
        :key="componentKey"
        :style="treeListStyles"

        :expand-field="adaptor.expandField"
        :sub-items-field="adaptor.subItemsField"
        :data-items="processedData"
        :columns="adaptor.columns"
        :filter="adaptor.filter4Tree"
        :filterable="false"
        :sort="adaptor.sort"
        :sortable="sortable"
        :resizable="false"

        @datastatechange="handleDataStateChange"
        @expandchange="onExpandChange"
        @selectionchange="onSelectionChange"
        @headerselectionchange="onHeaderSelectionChange"
        @columnresize="onColumnResize"        
        @rowclick="rowclick"
        @clickLink="clickLink"
        :toolbar="toolbar !== undefined && toolbar.length > 0 ? 'toolbar' : ''"
        :selected-field="SELECTED_FIELD"
        :data-item-key="dataItemKey" 
        :wrapperStyle="''"
    >
        <template v-slot:toolbar>
          <div class="ms-auto">
            <VBtn v-for="item in toolbar" :key="item.action" 
              size="small"
              color="primary"
              :prepend-icon="getIcon(item.action)"
              @click="toolbarAction($event, `${item.action}`)"
            >
              <spen>{{item.title}}</spen>
            </VBtn> 
          </div>
        </template>

      <template v-slot:template4TreeSelect="{props}"  v-if="adaptor._templateRefresh">
        <VCustomKTemplate 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem"
          templateKind="TreeSelect"
          :gridType="'tree'"
        ></VCustomKTemplate>
      </template>

      <template v-slot:template4Select="{props}"  v-if="adaptor._templateRefresh">
        <VCustomKTemplate 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem"
          templateKind="Select"
          :gridType="'tree'"
        ></VCustomKTemplate>
      </template>

      <template v-slot:template4Link="{props}"  v-if="adaptor._templateRefresh">
        <VCustomKTemplate 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem"
          templateKind="Link"
          @clickLink="clickLink"
          :gridType="'tree'"
        ></VCustomKTemplate>
      </template>

      <template v-slot:template4Num="{props}" v-if="adaptor._templateRefresh">
        <VCustomKTemplate 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem"
          templateKind="Number"
          :gridType="'tree'"
        ></VCustomKTemplate>
      </template>

      <template v-slot:template4Text="{props}"  v-if="adaptor._templateRefresh">
        <VCustomKTemplate 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem"
          templateKind="Text"
          :gridType="'tree'"
        ></VCustomKTemplate>
      </template>

      <template v-slot:template4TextArea="{props}"  v-if="adaptor._templateRefresh">
        <VCustomKTemplate 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem"
          templateKind="TextArea"
          :gridType="'tree'"
        ></VCustomKTemplate>
      </template>

      <!-- 행 선택용 체크 -->
      <template v-slot:template4RowCheck="{props}"  v-if="adaptor._templateRefresh">
        <VCustomKTemplate 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem"
          templateKind="RowCheck"
          @checkRow="checkRow"
          :gridType="'tree'"
        ></VCustomKTemplate>
      </template>

      <!-- 일반 체크 박스 -->
      <template v-slot:template4Check="{props}"  v-if="adaptor._templateRefresh">
        <VCustomKTemplate 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem"
          templateKind="Check"
          @checkRow="checkRow"
          :gridType="'tree'"
        ></VCustomKTemplate>
      </template>


      </TreeList>
  </div>
      
</template>

<style >
.custom-tree-list-0000 table {
  table-layout: fixed;
  /* word-break: break-all; */
  /* height : auto; */
}
</style>