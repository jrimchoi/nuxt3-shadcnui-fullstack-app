<script lang="ts">
const _actions = ['add', 'proc'] // <= _actions can be accessed in setup scope
export default {}
</script>

<script setup lang="ts">
import VCustomKTemplate, { VTemplateUtils } from '@/gs-caltex/core/components/kendo/VCustomKTemplate.vue';
import { CODE_GROUP } from '@/gs-caltex/core/libs/constants';
import { useCodeStore } from '@/gs-caltex/core/store/useCommStore';
import { filterBy, process } from '@progress/kendo-data-query';
import { Grid, GridToolbar } from '@progress/kendo-vue-grid';
import { v4 as uuidv4 } from 'uuid';
import { ADAPTOR_ACTION } from '../../classes/adaptor';
import { MathUtils, PageUtils } from '../../libs/utils';

interface Emit {
  (e: 'update:adaptor', value: any): void
}

interface Props {
  adaptor: any,
}

//const props = defineProps<Props>()
const props = withDefaults(defineProps<Props>(), {
  //componentKey: 0,
})
//const emit = defineEmits<Emit>()
const emit = defineEmits<{
  (e: 'update:adaptor', value: any): void,
  (e: 'onClickLink', event:any, item:any, field:string): void,
  (e: 'onSelectionChange', event:any, item:any): void,
  (e: 'ToggleEditMode', event:any): void,
  (e: 'openFileDialog', event:any): void,  // 파일 dialog open 
  (e: 'selectChange4KCombo', selectObject:any, rowIndex:number): void,  
  (e: 'add', addItem:any, rowIndex:number): void, // addRecord 호출됨. 
  (e: 'addItem', event:any): void, // addRecord 호출 X
  (e: 'gridDataBindPost', svid:string): void,    
  (e: 'onValueChanged', event:any, itemObject:any, field:string, oldValue:any): void, 
}>()
//const emit = defineEmits(_actions)

const codeStore = useCodeStore() // store 
const adaptor = ref(props.adaptor)
const toolbar = adaptor.value.toolbar
adaptor.value.sortable = adaptor.value.gridOptions.sortable
adaptor.value.groupable = adaptor.value.gridOptions.groupable
adaptor.value.pageable = adaptor.value.gridOptions.pageable
adaptor.value.height = adaptor.value.gridOptions.height ?  adaptor.value.gridOptions.height : adaptor.value.height
const componentKey = ref(adaptor.value.componentKey)
const _addRowCnt = ref(adaptor.value._addRowCnt)

if(adaptor.value.gridOptions.totalrow !== undefined){
  adaptor.value.totalrow = adaptor.value.gridOptions.totalrow
}
if(PageUtils.isNull(adaptor.value.gridOptions.totalTitle, "") !== ""){
  adaptor.value.totalTitle = adaptor.value.gridOptions.totalTitle
}
// tree-list 
adaptor.value.baseField = adaptor.value.gridOptions.baseField
adaptor.value.parentId = adaptor.value.gridOptions.parentId


const dataItem = ref();
const groupable = ref((adaptor.value.group && adaptor.value.group.length > 0) || adaptor.value.groupable ? true : false)
//const gridData = ref(groupable ? props.adaptor.groupData : props.adaptor.data)

console.log("groupable.....", groupable.value)
//groupable.value = "{ footer: 'visible'}"

const selected:any = ref({})  

// 페이징   
const pageSizeValue = ref(adaptor.value.take)
const pageSize = ref(adaptor.value.take)
const pagerSizes = ref(true)
const pagerType = ref("numeric") 
const pagerButtons = ref(10)
const pagerInfo = ref(true)
const pagePrevNext = ref(true)
//skip: 0, take: 10,
const pagerTypes = ref([
    {
      label: 'Numeric',
      value: 'numeric',
    },
    {
      label: 'Input',
      value: 'input',
    },
])

// 정렬 
//const sort = ref([])  // [{ field: 'ProductName', dir: 'asc' }]
const multiple = ref(adaptor.value.isMultipleSorting)
const allowUnsort = ref(true)

// 페이징 여부 설정 안하면 true 
adaptor.value.pageable = (adaptor.value.pageable === undefined ? true : adaptor.value.pageable)

const divCustomGrid:any = ref(null);
const divWrapper:any = ref(null);
let columns = ref([])

// aggregates 
// const aggregates = ref([
//   { field: 'plannedCost', aggregate: 'sum' },
// ])

// ##### Component Life-Cycle  #######
onMounted(() => {
  setDefault()
})

const setDefault = () => {
  let width = 0
  adaptor.value.columns.map((column:any, index:any) => {
      //console.log("column", column.width)
      if(column.field === "selected"){
        column.cell = "template4RowCheck"
        if(adaptor.value.isMultipleSelect) column.headerCell = "template4AllRowCheck"
        column.width = 48
      }
      
      if(column._required){ // 필수 requiredHeader
        //column.title = "<p class='text-warning'>*</p>" + column.title
        if(column.headerCell === undefined){
          column.headerCell = "requiredHeader" 
        }
      }

      if(adaptor.value.totalrow){ // total column
        if(column.footerCell === undefined && index === 0){ // 첫번째 컬럼에 total title 
          column.footerCell = footerCellFunction   
        }
      }
      if(column._total && adaptor.value.totalrow){ // total column
        if(column.footerCell === undefined){
          
          column.footerCell = footerCellFunction   // footerCell: footerCellFunction
        }
      }
  })
}

// grid total row 
const footerCellFunction = (h:any, emptyElement:any , props:any, listeners:any ) => {
  if(adaptor.value.totalrow){
    if(props.field === "selected"){
      return h('span', {
        onClick: customHandler,
        class: "text-center custom-total-row-title",
      }, [adaptor.value.totalTitle])
    }else{

      const filtered = adaptor.value.columns.filter((item: any) => {
        return item.field === props.field  
      })

      let column:any = null
      if(filtered !== undefined && filtered !== null && filtered.length > 0){
        column = filtered[0]
      }

      // if(props.field === "gscBudgetAmount_rate"){
      //console.log("gggggggggggggggg", column, typeof(column._total), typeof(column._totalFunc))
      // }
      
      let total = 0
      if(typeof(column._totalFunc) === "function"){
        //total = 100
        total = (column._totalFunc)(props.field)
      }else{
        total = adaptor.value.viewData.reduce(function (sum:number, item:any) {
          return PageUtils.isNull4Num(sum, 0) + PageUtils.isNull4Num(item[props.field], 0)
        }, 0)
      }

      let numVal4Num = MathUtils.toFixedRes(total)
      let numVal = MathUtils.num4Digit(numVal4Num)

      //console.log("hhhhhhhhh", props.field, numVal, column._format)

      if(column !== undefined && column !== null){
        if(!PageUtils.isStrEmpty(column._format)){
          numVal = VTemplateUtils.commaNum(numVal4Num, column._format)
        }
      }

      return h('span', {
        onClick: customHandler,
        class: "text-end custom-total-row-field",
      }, [numVal])
    }
  }else{
    return false
  }
}
const customHandler = (e:any) => {
  console.log('customHandler', e);
}

// const requiredField = (h:any, emptyElement:any , props:any, listeners:any ) => {
//   return h('span', {
//       onClick: this.customHandler
//   }, ['custom ' + props.field]);
// }

onUpdated(() => {
  // console.log("VCustomKGrid onUpdated....000", props.adaptor.componentKey, adaptor.value.componentKey)

  // if(props.adaptor.componentKey !== adaptor.value.componentKey){
  //   console.log("VCustomKGrid onUpdated....", props.adaptor.componentKey, adaptor.value.componentKey)
  // }
})

// ####### fuction && event #######
const filteredData = computed(() => {
  console.log("VCustomKGrid adaptor.value.filter", adaptor.value.filter)
  if(adaptor.value.filter){
    adaptor.value.data = filterBy(adaptor.value._data, adaptor.value.filter)
  }else{
    adaptor.value.data = [...adaptor.value._data]
  }

  return JSON.parse(JSON.stringify(adaptor.value.data )) 
})

const getData = (svid:string) => {
    console.log("VCustomKGrid getData........XXXXXXXXX", adaptor.value.filter , filteredData.value.length)
    
    adaptor.value._templateRefresh = true ///// 무조건 true 

    //adaptor.value.loader = true
    //1 adaptor.value._templateRefresh = false  // template column refresh 

    setTimeout(() => {
      //adaptor.value.loader = false
      let dataItems:any = process( (filteredData.value), {
        take: adaptor.value.pageable ? adaptor.value.take : 999999999999,
        skip: adaptor.value.pageable ? adaptor.value.skip : 0,
        group: adaptor.value.group,
        sort: adaptor.value.sort,
        ////filter: adaptor.value.filter,
      });
      adaptor.value.viewData = dataItems.data

      //1 adaptor.value._templateRefresh = true  // template column refresh 
      adaptor.value._setDataPost = false

      if(adaptor.value.group !== undefined && adaptor.value.group.length > 0){
        gridGrouping(svid)
      }

      adaptor.value.componentKey ++
      componentKey.value = adaptor.value.componentKey

      emit("gridDataBindPost", svid)
      
    }, 100);
}

const filterChange = (e:any) => {
  //adaptor.value.loader = true
  // The idea behind using the following setTimeout method is to
  // demonstrate how we can show a loader while fetching data.
  // In real-life scenarios with remote data binding, the 'loader'
  // property should be updated before making a server request
  // and after the request completes.
  console.log("e.filter", e.filter)
  setTimeout(() => {
    adaptor.value.filter = e.filter
    //adaptor.value.loader = false
  }, 10);
}

const createAppState = (dataState:any) => {  
  adaptor.value.group = dataState.group;
  adaptor.value.take = dataState.take;
  adaptor.value.skip = dataState.skip;

  console.log("createAppState", dataState.group)
  if(dataState.group !== undefined && dataState.group.length > 0){
    console.log("createAppState...group..exists", dataState.group)
    getData("group")
  }else{
    getData("createAppState")
  }
  
}

const gridGrouping = (svid:string) => { // 그리드에 데이터 바인딩 이후   
  // 그룹 설정후 코드성 필드를 텍스트로 표시 
  if(svid === "group"){
    for(let i=0;i<adaptor.value.viewData.length;i++){
      //console.log("aaaa", i , adaptor.value.viewData[i])
      let aggr = adaptor.value.viewData[i].aggregates
      if(typeof(aggr === "object")){
        getChildrenAggrates(adaptor.value.viewData[i])
      }
    }
  }
}

const getChildrenAggrates = (subItem:any) => {   
  let aggr = subItem.aggregates
  if(subItem.items === undefined){
    // dummy
  }else{
    let field = subItem.field
    let value = subItem.value

    subItem._value = value  // 기존값을 담아둔다. 

    let filtered = adaptor.value.columns.filter((item:any) => {
      return item.field === field 
    })

    if(filtered.length > 0){
      let filterItem = filtered[0]
      if(filterItem._codeGroup !== undefined){
        if(filterItem._codeGroup === CODE_GROUP.PROJECT){
          subItem.value = codeStore.getProjectName(value)
        }else if(filterItem._codeGroup === CODE_GROUP.PERSON){
          subItem.value = codeStore.getPersonName(value)
        }else if(filterItem._codeGroup === CODE_GROUP.BUSINESS_UNIT){
          subItem.value = codeStore.getBuName(value)
        }else{
          subItem.value = codeStore.getTitle4Code(filterItem._codeGroup, filterItem._codeGroupSub, value)
        }
      }
    }

    for(let i=0;i<subItem.items.length;i++){
      if(subItem.items[i].aggregates !== undefined && typeof(subItem.items[i].aggregates) === "object"){
        getChildrenAggrates(subItem.items[i])
      }
    }
  }
}

const dataStateChange = (event:any) => {
  console.log("dataStateChange", event)
  createAppState(event.data);
}

const expandChange = (event:any) => {
  console.log("expandChange", event)
  event.dataItem[event.target.$props.expandField] = event.value;
}

const rowClick = (e:any) => {
  console.log("Custom Grid rowClick", e.dataItem, adaptor.value.selectedRows)
  adaptor.value.clickItem = e.dataItem;  // rowClick --> watch(adaptor.value
}

const clickLink = (e:any, item:any, field:string) => { // cell click --> drawer open 
  console.log("Custom Grid  clickLink...1111", field)
  adaptor.value.clickItem = item  // 2024.03.27 kimjy 
  emit("onClickLink", e, item, field)
}

const onSelectionChange = (e:any, item:any, uuid:string) => { // grid row checked post  
  //console.log("행선택 20 : Grid onSelectionChange...000", item, adaptor.value.selectedRows)

  checkToggle(uuid)
  
  if(adaptor.value.selectedRows.length > 0){
    let id = adaptor.value.selectedRows[0]
    let filterData = [...adaptor.value.data.filter((item:any) =>(item["uuid"] === id))]
    if(filterData.length > 0) adaptor.value.selectedItem = filterData[0]
  }else{
    adaptor.value.selectedItem = {}
  }

  // check여부 상관없이 행을 클릭한것으로 간주
  adaptor.value.clickItem = item // 행클릭시 clickItem 담기 

  //console.log("행선택 40 : Grid onSelectionChange...000", adaptor.value.selectedRows)

  emit("onSelectionChange", e, item)
}

const isMultiSelect4Check = ref(adaptor.value.isMultipleSelect)
const select4Check = ref(false)
const selectComponentKey = ref(0)
const checkToggle = (checkID: string) => {  
  if(adaptor.value.selectedRows === undefined){
    adaptor.value.selectedRows = []
  }

  if (adaptor.value.selectedRows?.includes(checkID)) {  
    const index = adaptor.value.selectedRows.indexOf(checkID)
    adaptor.value.selectedRows.splice(index, 1) // 현재거 제거하고 

    if(!adaptor.value.isMultipleSelect){ // 이전거 다 제거 
      adaptor.value.selectedRows = []
    }

  }else {
    if(!adaptor.value.isMultipleSelect){  // 이전거 다 제거하고..
      adaptor.value.selectedRows = []
    }
    adaptor.value.selectedRows.push(checkID) // 현재거 담고.. 
  }

  selectComponentKey.value ++ // 행선택 체크 변경됨..

  console.log("행선택 30 : Grid checkToggle...000", adaptor.value.selectedRows, isMultiSelect4Check.value)
}

const selectAll = ref("");
const allSelected4Check = ref(false)
const checkAllToggle = (e:any, selectedRows:string[], allSelected:boolean) => { 
  console.log("전체선택 20 : VCustomKGrid checkAllToggle", allSelected)
  
  adaptor.value.selectedRows = selectedRows

  if(adaptor.value.selectedRows === undefined){
    adaptor.value.selectedRows = []
  }

  adaptor.value.allSelected = allSelected //!adaptor.value.allSelected
  
  if (adaptor.value.allSelected) {
    adaptor.value.viewData.forEach((item :any) => {
      if (!adaptor.value.selectedRows.includes(`${item["uuid"]}`))
      adaptor.value.selectedRows.push(`${item["uuid"]}`)
    })
  }
  else {
    adaptor.value.selectedRows = []
  }

  ////selectComponentKey.value ++
  allSelected4Check.value = adaptor.value.allSelected

  console.log("전체선택 30 : checkAllToggle....", allSelected4Check.value, adaptor.value.selectedRows.length)

  ////componentKey.value++ xxx
  ////selectAll.value.toggleAllCheck(adaptor.value.selectedRows)  // 자식함수 호출...호출됨.
}

// 설정한 ref 명이랑 똑같은 변수명으로 선언한다.


const toolbarAction = (e:any, action:any) => { // cell click --> drawer open 
  console.log("action...000", action)
  if(action.toUpperCase() === "Add".toUpperCase()){
    addRecord(action)
  }else{
    emit(action, e, action)
    emit('update:adaptor', adaptor.value)
  }
}

// add new record 
const addRecord = (action:string) => { 
  console.log("addRecord....", action)
  
  if(!adaptor.value.editMode){
    _addRowCnt.value = 0
    adaptor.value._addRowCnt = 0
    alert("읽기전용모드입니다.")
    return
  }
  
  if(adaptor.value._addRowCnt === 0 && action !== "add"){
    return 
  }

  // const newRecord = { id: adaptor.value.data.length + 1 };
  // const data = adaptor.value.data.slice();
  // data.id = newRecord.id;
  // data._rowType = "I";
  // data.unshift(newRecord);

  let dataItem:any = {
    _rn: String(adaptor.value.viewData.length + 1), 
    _rowType:"I", 
    uuid:uuidv4(),
    //id: "", 
  }

  adaptor.value.viewData.unshift(dataItem)  // 첫행 
  let rowIndex = 0

  // rn 갱신 : important !!! --> (_rn -1) === array index 로 간주하기 위해 
  for(let i=0 ; i < adaptor.value.viewData.length ; i++){
    adaptor.value.viewData[i]._rn = (i+1)
  }
  
  // #### group 사용시 저장 처리는 보완해야함.
  adaptor.value.componentKey ++
  // adaptor.value._templateRefresh = false  // template column refresh 
  // setTimeout(function() {
  //   adaptor.value._templateRefresh = true
  // }, 50)
  
  _addRowCnt.value = 0   // 초기화 
  adaptor.value._addRowCnt = 0

  if(action === "ADD_EX"){ // by script 
    console.log("ADD_EX adaptor.value", adaptor.value)
    emit('update:adaptor', adaptor.value)
  }else{
    emit('update:adaptor', adaptor.value)
    emit('add', dataItem, rowIndex)
  }

}

const itemChange = (e:any) => {
  console.log("itemChange", adaptor.value.columns)

  // const data:any = adaptor.value.data.slice();
  // const index = data.findIndex(d => d.id === e.dataItem.id);
  // data[index] = { ...data[index], [e.field]: e.value };
  // adaptor.value.data = data;
}

// kcombo template > kGrid > 부모컴포넌트  
const componentKey4KCombo = ref(10000000)
const selectChange4KCombo = (selectObject:any, rowIndex:number) => {
  console.log("VCustomKGrid selectChange4KCombo...#####", selectObject, adaptor.value.clickItem)
  emit('selectChange4KCombo', selectObject, rowIndex)
  ////componentKey4KCombo.value ++
}

const pageChangeHandler = (e:any) => {
  //adaptor.value.loader = true;
  // The idea behind using the following setTimeout method is to
  // demonstrate how we can show a loader while fetching data.
  // In a real-life scenarios with remote data binding, the 'loader'
  // property should be updated before making a server request
  // and after the request completes.
  setTimeout(() => {
    //adaptor.value.loader = false;
    adaptor.value.skip = e.page.skip;
    //adaptor.value.take = e.page.take;
    adaptor.value.take = e.event.value === 'all' ? 1000000 : e.page.take;
    pageSizeValue.value = e.event.value;

    adaptor.value.currentPage = (adaptor.value.skip/adaptor.value.take) + 1

    console.log("pageChangeHandler", adaptor.value.currentPage, adaptor.value.skip , adaptor.value.take )

    getData("pageChangeHandler")
    
  }, 10);
}

const total = computed(() => {
  const totalrow = (adaptor.value.filter ? filteredData.value.length : adaptor.value.data.length) //gridData.value ? gridData.value.length : 0
  console.log("totalrow", totalrow)
  return totalrow
})

const pageable = computed(() => {
  //console.log("pageable........", adaptor.value.pageable, pagerSizes.value)
  if(adaptor.value.pageable){
    return {
        buttonCount: pagerButtons.value,
        info: pagerInfo.value,
        type: pagerType.value,
        pageSizes: pagerSizes.value ? [10, 15, 20, 50, 100, 'all'] : undefined,
        previousNext: pagePrevNext.value,
        pageSizeValue: pageSizeValue.value,
      }
  }else{
    return false
  }

})

// sorting 
const changeHandler = (e:any) => {
  allowUnsort.value = e.target.checked;
}
const changeMultiHandler = (e:any) => {
  allowUnsort.value = e.target.checked;
}
const sortChangeHandler = (e:any) => {
  console.log("sortChangeHandler", e, e.sort)
  
  if(e.event.field === "selected"){
    //console.log("zzzzzzzzzz", adaptor.value.selectedRows)
    ////checkAllToggle(e, adaptor.value.selectedRows, adaptor.value.allSelected)
  }else{
    adaptor.value.sort = e.sort;
    getData("sortChangeHandler")
  }
}

const sortable = computed(() => {
  if(adaptor.value.sortable || (adaptor.value.sortable !== false && adaptor.value.sort && adaptor.value.sort.length > 0)){ 
    return {
      allowUnsort: allowUnsort.value,
      mode: multiple.value ? 'multiple' : 'single'
    }
  }else{
    return false
  }
})

const columnresize = (e:any) => {
  console.log("columnresize")
}

const columnReorder = function(options:any) {
  adaptor.value.columns = options.columns;
}

const getIcon = (action:string) => {
  if(action.toLowerCase().indexOf("add".toLowerCase()) >= 0) return "mdi-pen-plus"
  if(action.toLowerCase().indexOf("delete".toLowerCase()) >= 0) return "mdi-trash-can-outline"
  if(action.toLowerCase().indexOf("save".toLowerCase()) >= 0) return "mdi-content-save-edit-outline"
  
  return "mdi-calendar-cursor"
}

// ####### watach && watchEffect #######
watchEffect(() => {
  if(adaptor.value._setDataPost){ 
    getData("watchEffect")
    return
  }
})

watchEffect(() => {
  console.log("VCustomKGrid watchEffect addrowcnt ", _addRowCnt.value, adaptor.value._addRowCnt )
  if(_addRowCnt.value !== adaptor.value._addRowCnt){
    addRecord("ADD_EX")
  }
})

watchEffect(() => {
  console.log("VCustomKGrid watchEffect componentKey ", componentKey.value, adaptor.value.componentKey )
  if(componentKey.value !== adaptor.value.componentKey){
    renderComponent()
  }
})

const renderComponent = () => {
  console.log("renderComponent ######### ", adaptor.value, adaptor.value.toolbar)
  if(adaptor.value === undefined) return 

  // {title:"Edit", action:"ToggleEditMode", auth: true, },
  const filtered = adaptor.value.toolbar.filter((item:any) => {
    return item.action === ADAPTOR_ACTION.TOGGLE_EDIT_MODE
  })
  

  if(adaptor.value.toolbar && adaptor.value.toolbar.length > 0){
    console.log("VCustomKGrid renderComponent 00 ", componentKey.value, adaptor.value.componentKey, adaptor.value.toolbar)
    if(filtered.length > 0){
      adaptor.value.toolbar[0].title = adaptor.value.editMode ? "View" : "Edit" // memeber 등록 
    }
  }else{
    console.log("VCustomKGrid renderComponent 11 ", componentKey.value, adaptor.value.componentKey, "no toolbar")
  }

  componentKey.value = adaptor.value.componentKey
}

const onValueChanged = function(e:any, itemObject:any, field:string, oldValue:any) {
  console.log("onValueChanged.....VCustomKGrid",  e, itemObject, field, oldValue)
  emit("onValueChanged", e, itemObject, field, oldValue)
}

// watchEffect(() => { 
//   if(selectComponentKey.value > 0){
//     selectComponentKey.value ++
//   }
// })

</script>
<!-- :style="{ height: '340px' }" -->
<!-- kendo grid column template : check -->
<template >
  <div ref="divWrapper">
      <Grid
        :key="componentKey"
        ref="divCustomGrid"
        :style="{ height: adaptor.height + 'px' }"
        :data-items="adaptor.viewData"  
        :resizable="true"
        :reorderable="false"
        @columnreorder="columnReorder"
        :groupable="groupable"
        :group="adaptor.group"

        :pageable="pageable"
        :take="adaptor.take"
        :skip="adaptor.skip"
        :page-size="pageSize"
        :total="total"
        :info="true"

        :sortable="sortable"
        :sort= "adaptor.sort"
        @sortchange="sortChangeHandler"

        :filterable="false"   
        :filter="adaptor.filter"
        @filterchange="filterChange"
        
        :expand-field="'expanded'"
        :columns="adaptor.columns"
        :loader="adaptor.loader"
        @datastatechange="dataStateChange"
        @expandchange="expandChange"
        @rowclick="rowClick"
        @itemchange="itemChange"
        @columnresize="columnresize"
        @pagechange="pageChangeHandler"
      >
      <GridToolbar class="ms-auto"  v-if="adaptor.toolbar && adaptor.toolbar.length > 0" >  
        
        <!-- :hidden="item.auth === undefined ? false : !item.auth" -->
        <VBtn v-for="item in adaptor.toolbar" :key="item.action" 
          size="small"
          color="primary"
          :prepend-icon="getIcon(item.action)"
          @click="toolbarAction($event, `${item.action}`)"
          :disabled="item.disabled === undefined ? false : typeof(item.disabled) === 'function' ? (item.disabled)(item.action) :  item.disabled " 
          :hidden="item.auth === undefined ? true : typeof(item.auth) === 'function' ? !(item.auth)(item.action) :  !item.auth " 
          :title="item.title"
        >
          <span>{{item.title}}</span>
        </VBtn>  

        <!-- <VBtn v-for="item in adaptor.toolbar" :key="item.action" 
          icon
          variant="text"
          size="small"
          color="default"
          @click="toolbarAction($event, `${item.action}`)"
          :disabled="item.auth === undefined ? true : typeof(item.auth) === 'function' ? !(item.auth)(item.action) :  !item.auth " 
          :hidden="item.auth === undefined ? true : typeof(item.auth) === 'function' ? !(item.auth)(item.action) :  !item.auth " 
          :title="item.title"
        >
          <VIcon 
            :icon="getIcon(item.action)" 
            color="primary"
          >
          </VIcon>
        </VBtn> -->

      </GridToolbar>

      <template v-slot:requiredHeader="{props}">
        <span>
          <sup style="color: tomato;">* </sup>{{props.title}}
        </span>
      </template>

      <!-- 행 선택용 체크 -->
      <template v-slot:template4RowCheck="{props}"  v-if="adaptor._templateRefresh">
        <VCustomKTemplate 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem"
          templateKind="RowCheck"
          @checkRow="onSelectionChange"
          v-model:selectedRows="adaptor.selectedRows"
          :allSelected4Check="allSelected4Check"
          :select4Check="select4Check"
          v-model:selectComponentKey="selectComponentKey"
          :isMultiSelect4Check="isMultiSelect4Check"
        ></VCustomKTemplate>
      </template>

      <!-- 전체행 선택용 체크 -->
      <template v-slot:template4AllRowCheck="{props}" v-if="adaptor._templateRefresh">
        <VCustomKTemplate  ref="selectAll" 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem"
          templateKind="AllRowCheck"
          @checkAllRow="checkAllToggle"
          v-model:selectedRows="adaptor.selectedRows"
          :allSelected4Check="allSelected4Check"
        ></VCustomKTemplate>
      </template>

      <!-- 일반 체크 박스 -->
      <template v-slot:template4Check="{props}"  v-if="adaptor._templateRefresh">
        <VCustomKTemplate 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem"
          templateKind="Check"
          v-model:componentKey="componentKey"
        ></VCustomKTemplate>
      </template>
      
      <template v-slot:template4TreeSelect="{props}"  v-if="adaptor._templateRefresh">
        <VCustomKTemplate 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem" 
          templateKind="TreeSelect"
          v-model:componentKey="componentKey"
        ></VCustomKTemplate>
      </template>

      <template v-slot:template4Select="{props}"  v-if="adaptor._templateRefresh">
        <VCustomKTemplate 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem"
          templateKind="Select"
          v-model:componentKey="componentKey"
        ></VCustomKTemplate>
      </template>

      <template v-slot:template4Combo="{props}"  v-if="adaptor._templateRefresh">
        <VCustomKTemplate 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem"
          templateKind="Combo"
          v-model:componentKey="componentKey"
        ></VCustomKTemplate>
      </template>

      <template v-slot:template4KCombo="{props}"  v-if="adaptor._templateRefresh">
        <VCustomKTemplate 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem"
          templateKind="KCombo"
          @selectChange4KCombo="selectChange4KCombo"
          v-model:componentKey="componentKey"
          @clickLink="clickLink"
        ></VCustomKTemplate>
      </template>

      <template v-slot:template4KMultiCombo="{props}"  v-if="adaptor._templateRefresh">
        <VCustomKTemplate 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem"
          templateKind="KMultiCombo"
          v-model:componentKey="componentKey"
        ></VCustomKTemplate>
      </template>

      <template v-slot:template4Link="{props}"  v-if="adaptor._templateRefresh">
        <VCustomKTemplate 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem"
          templateKind="Link"
          @clickLink="clickLink"
          v-model:componentKey="componentKey"
        ></VCustomKTemplate>
      </template>

      <template v-slot:template4Num="{props}" v-if="adaptor._templateRefresh">
        <VCustomKTemplate 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem"
          templateKind="Number"
          v-model:componentKey="componentKey"
          @onValueChanged="onValueChanged"
        ></VCustomKTemplate>
      </template>

      <template v-slot:template4Text="{props}"  v-if="adaptor._templateRefresh">
        <VCustomKTemplate 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem"
          templateKind="Text"
          v-model:componentKey="componentKey"
          @onValueChanged="onValueChanged"
        ></VCustomKTemplate>
      </template>
 
      <template v-slot:template4TextArea="{props}"  v-if="adaptor._templateRefresh">
        <VCustomKTemplate 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem"
          templateKind="TextArea"
          @onValueChanged="onValueChanged"
        ></VCustomKTemplate>
      </template>
      
      <!-- icon -->
      <template v-slot:template4Icon="{props}"  v-if="adaptor._templateRefresh">
        <VCustomKTemplate 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem"
          templateKind="Icon"
          @clickLink="clickLink"
          v-model:componentKey="componentKey"
        ></VCustomKTemplate>
      </template>

      <!-- Progress -->
      <template v-slot:template4Progress="{props}"  v-if="adaptor._templateRefresh">
        <VCustomKTemplate 
          :columnProps="props"
          :colums="adaptor.columns"
          v-model:dataItem="dataItem"
          templateKind="Progress"
        ></VCustomKTemplate>
      </template>

    </Grid>
  </div>
</template>

<style>
.k-pager-md .k-pager-info {
  display: block !important;
}

.k-grid-header .k-header {
  vertical-align: middle !important;
}

.k-table-th.k-header.k-grid-header-sticky span.k-column-resizer {
  display: none !important;
}

td._chk .v-input__control {
  padding-inline-start: 10px;
}

td._chkAll .v-input__control {
  block-size: 12px;
  padding-inline-start: 2px;
}

.k-header .k-link {
  justify-content: center !important;
}
</style> 

<!-- k-dropdownlist k-picker k-picker-md k-rounded-md k-picker-solid -->
