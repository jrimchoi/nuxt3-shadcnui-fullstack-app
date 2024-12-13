import { PageUtils } from '@/gs-caltex/core/libs/utils'
import { filterBy, process } from '@progress/kendo-data-query'
import { saveExcel } from '@progress/kendo-vue-excel-export'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'vue-router'
import { KTEMPLATE } from '../libs/constants'
import { useCodeStore } from '../store/useCommStore'

export const ADAPTOR_TYPE = {
  GRID: 'grid',
  TREE: 'tree',
  DATA: 'data',
}

export const ADAPTOR_ACTION = {
  ADD: 'add', // addRecord 호출됨.
  DELETE: 'delete',
  SAVE: 'Save',
  TOGGLE_EDIT_MODE: 'ToggleEditMode',
  OPEN_FILE_DIALOG: 'openFileDialog',
  ADD_ITEM: 'addItem',
  OPEN_DRAWER: 'openDrawer',
}

export class Adaptor {
  // 클래스 프로퍼티를 사전 선언하여야 한다
  name: string

  viewMode: string // I,U,D, R(읽기전용)

  _data: any // fetched data
  data: any // 컴포넌트와 연동되는 데이터 fetch data >> filtered
  viewData: any // 화면에서 보여지는 데이터 (페이징, 필터 처리 후 화면에 보여지는 데이터 )

  groupData: any // xxxx

  originData?: any // 변경여부 확인용
  originFormatData?: any // fetch 데이터 (가공 하지 않은 원래 포맷)

  selectedRows: any
  selectedItem: any
  clickItem: any

  loader?: boolean // for kendo grid
  skip: number
  take: number
  totalRows?: number
  currentPage: number

  group?: any
  groupable: any
  columns?: any
  pageable: any
  sortable: any
  expandedItems?: any
  toolbar?: any
  totalrow?: boolean
  totalTitle?: string

  subItemsField: string // for kendo tree-list
  expandField: string
  expanded: any[]
  filter: any
  filter4Tree: any
  sort: any[]

  baseField: string // tree-list
  parentField: string
  expandAll: boolean // all or top

  isDrawerOpen: boolean
  isCommentOpen: boolean

  _isChanged: boolean
  _setDataPost: boolean
  _templateRefresh: boolean

  gridOptions: any
  height: any
  router: any
  multiCodeFileds: string[]
  dateFieldProps: any

  filterWatcher4Tiled: number

  componentKey: number // 그리드키값, 그리드 리랜더링용
  editMode: boolean // 그리드 에디팅 모드여부
  changedRowsIndex: any[] // 그리드 IU 시 변경된 데이터의 rowIndex
  changedRowsUUID: any[]
  keyField: string // 행별 데이터의 키필드

  isMultipleSelect: boolean // 여러행 선택 가능여부
  _addRowCnt: number

  include4relId: boolean // setData 에서 relId를 flat data에 포함시킬지 여부
  isMultipleSorting: boolean

  constructor(name: string, multiCodeFileds?: string[], dateFieldProps?: any) {
    // 클래스 프로퍼티수에 값을 할당
    this.name = name // adaptor type

    this.viewMode = ''
    this._data = []
    this.data = []
    this.viewData = []

    this.groupData = [] // xxx

    this.clickItem = {}
    this.selectedRows = []

    // this.selectedItem = {id:"", };
    this.selectedItem = { id: '', dataelements: {}, relelements: { gscGateResult: undefined } }

    this.expanded = []
    this.filter = { filters: [] } // grid filter
    this.filter4Tree = [] // tree-list filter

    this.sortable = true
    this.sort = []

    this.groupable = false
    this.group = []
    this.totalrow = false
    this.totalTitle = 'Total'

    this.subItemsField = 'subItems'
    this.expandField = 'expanded'
    this.baseField = 'id'
    this.parentField = 'parentId'
    this.expandAll = false

    this.loader = false
    this.skip = 0
    this.take = 20
    this.totalRows = 0
    this.currentPage = 0

    this.expandedItems = []
    this.toolbar = []
    this.isDrawerOpen = false
    this.isCommentOpen = false

    this._isChanged = false
    this._setDataPost = false
    this._templateRefresh = false

    this.gridOptions = {}
    this.height = 200

    this.router = useRouter()
    this.multiCodeFileds = multiCodeFileds === undefined ? [] : multiCodeFileds
    this.dateFieldProps = dateFieldProps === undefined ? {} : dateFieldProps
    this.filterWatcher4Tiled = 0

    this.componentKey = 0 // 그리드키값, 그리드 리랜더링용
    this.editMode = false // 그리드 에디팅 모드여부
    this.changedRowsIndex = []
    this.changedRowsUUID = []
    this.keyField = 'id'
    this.isMultipleSelect = true

    this._addRowCnt = 0

    this.include4relId = false
    this.isMultipleSorting = true
  }

  setPagingOption(pageable:boolean, serverPaging:boolean) {
    const adaptor = this
    adaptor.gridOptions.pageable = pageable
    adaptor.gridOptions.serverPaging = serverPaging 

    adaptor.pageable = pageable 
    ////adaptor.serverPaging = serverPaging 
  }

  setData(searchResult1: any, filterCondition?: any): Promise<any> {
    const adaptor = this

    adaptor.originFormatData = JSON.parse(JSON.stringify(searchResult1)) // structuredClone(toRaw(searchResult1))

    const multiCodeFileds = adaptor.multiCodeFileds
    const dateFieldProps = adaptor.dateFieldProps // JSON.parse(JSON.stringify(adaptor.dateFieldProps))

    // patch-20240327-1000 kim jy
    if (filterCondition !== undefined && filterCondition !== null && filterCondition !== '')
      adaptor.searchFilter(filterCondition)

    console.log('setData searchResult1', searchResult1)

    const data: any = []

    // 초기화
    adaptor.skip = 0

    if (searchResult1.items === undefined) {
      // total count not exists
      adaptor.totalRows = searchResult1.length

      for (let i = 0; i < searchResult1.length; i++) {
        const id = searchResult1[i].id
        const relId = searchResult1[i].relId

        let item = null
        if (searchResult1[i].dataelements === undefined)
          item = searchResult1[i]
        else
          item = searchResult1[i].dataelements

        PageUtils.code4VSelectMultiple(item, multiCodeFileds) // 1,2,3 --> [1,2,3]

        // dataelements
        data.push(JSON.parse(JSON.stringify(item))) // data.push(structuredClone(toRaw(item)))

        data[i].id = id // structuredClone(toRaw(id))
        if (adaptor.include4relId)
          data[i].relId = relId

        data[i]._rowType = '' // I, U, D,
        data[i]._rn = i + 1
        data[i]._dateFieldProps = dateFieldProps
        data[i].uuid = uuidv4() // important !!!

        if (searchResult1[i].hasOwnProperty('value')) {
          // 코드도움용
          data[i].value = searchResult1[i].value
        }
      }
    }
    else {
      // here...
      adaptor.totalRows = searchResult1.items // total count
      for (let i = 0; i < searchResult1.data.length; i++) {
        const id = searchResult1.data[i].id
        const relId = searchResult1.data[i].relId

        let item = null
        if (searchResult1.data[i].dataelements === undefined)
          item = searchResult1.data[i]
        else
          item = searchResult1.data[i].dataelements

        PageUtils.code4VSelectMultiple(item, multiCodeFileds) // 1,2,3 --> [1,2,3]

        // dataelements
        data.push(JSON.parse(JSON.stringify(item))) // data.push(structuredClone(toRaw(item)))

        data[i].id = id // structuredClone(toRaw(id))
        if (adaptor.include4relId)
          data[i].relId = relId

        data[i]._rowType = '' // I, U, D,
        data[i]._rn = i + 1
        data[i]._dateFieldProps = dateFieldProps
        data[i].uuid = uuidv4() // important !!!

        if (searchResult1.data[i].hasOwnProperty('value')) {
          // 코드도움용
          data[i].value = searchResult1.data[i].value
        }
      }
    }

    adaptor.loader = true

    /// /setTimeout(() => {

    adaptor.loader = false
    adaptor.originData = JSON.parse(JSON.stringify(data)) // structuredClone(toRaw(data)) // $$$$

    adaptor.viewData = JSON.parse(JSON.stringify(data)) // structuredClone(toRaw(data))
    adaptor.data = JSON.parse(JSON.stringify(data)) // structuredClone(toRaw(data))
    adaptor._data = JSON.parse(JSON.stringify(data)) // structuredClone(toRaw(data))

    adaptor.selectedRows = []
    adaptor.selectedItem = {}
    adaptor.clickItem = {}
    adaptor.changedRowsIndex = [] // grid 저장시 변경된 rowindex

    console.log('adaptor.data: ', adaptor)
    console.log('adaptor.list.data length', adaptor.data.length)

    // adaptor.viewData[0].id = "uuuuuuuuuuu"
    // console.log("adaptor.data: xxxxxxxxxx", adaptor.viewData[0].id)
    // console.log("adaptor.data: yyyyyyyyyy", adaptor.data[0].id)
    // console.log("adaptor.data: yyyyyyyyyy", adaptor._data[0].id)
    // console.log("adaptor.data: yyyyyyyyyy", adaptor.originData[0].id)

    // tree-list expand
    if (adaptor.name === 'tree') {
      if (adaptor.expandAll)
        adaptor.expandAll4Tree()
      else
        adaptor.expandTop4Tree()
    }

    adaptor._setDataPost = true

    /// /1 adaptor._templateRefresh = true

    if (adaptor.name === ADAPTOR_TYPE.DATA)
      adaptor.refreshData4NoGrid()

    return new Promise(resolve => {
      // resolve(structuredClone(toRaw(adaptor)))
      resolve(adaptor)
    })

    /// /}, 100)
  }

  copyData(copyData: any) {
    // viewData 를 복사해서.. 나머지 데이터 생성
    const adaptor = this

    adaptor.currentPage = 1

    adaptor.viewData = PageUtils.cloneObject(copyData)
    adaptor.originData = PageUtils.cloneObject(copyData)
    adaptor.data = PageUtils.cloneObject(copyData)
    adaptor._data = PageUtils.cloneObject(copyData)
  }

  reCreateData(baseData: any) {
    // data --> adaptor data
    const adaptor = this

    adaptor.viewData = PageUtils.cloneObject(baseData)
    adaptor.originData = PageUtils.cloneObject(baseData)
    adaptor.data = PageUtils.cloneObject(baseData)
    adaptor._data = PageUtils.cloneObject(baseData)

    if ([ADAPTOR_TYPE.GRID, ADAPTOR_TYPE.TREE].includes(adaptor.name))
      this.refreshViewData()
  }

  set(rowIndex: number, fieldNm: string, value: any) {
    const adaptor = this

    if (rowIndex === undefined) {
      alert('rowIndex undefined....')

      return
    }

    adaptor.viewData[rowIndex][fieldNm] = value
    adaptor.componentKey++

    /// / 1 adaptor._templateRefresh = false; // template column refresh
    // setTimeout(function () {
    // 1 adaptor._templateRefresh = true;
    // }, 1);
  }

  setValues(rowIndex: number, field: string[], fromObject: any) {
    const adaptor = this

    if (rowIndex === undefined) {
      alert('rowIndex undefined....')

      return
    }

    for (let i = 0; i < field.length; i++) {
      const fieldNm = field[i]

      if (fromObject === undefined)
        adaptor.set(rowIndex, fieldNm, null)
      else
        adaptor.set(rowIndex, fieldNm, fromObject[fieldNm])
    }

    adaptor.componentKey++

    // adaptor._templateRefresh = false  // template column refresh
    // setTimeout(function() {
    //   adaptor._templateRefresh = true
    // }, 1)
  }

  reApplyData(id: string, fieldNm: string, value: any, isFetchData?: boolean, isData?: boolean, isViewData?: boolean) {
    // id 기준으로 일치하는 행의 데이터를 reset
    // _data , data , viewData

    const adaptor = this

    isFetchData = isFetchData === undefined ? true : isFetchData
    isData = isData === undefined ? true : isData
    isViewData = isViewData === undefined ? true : isViewData

    if (isFetchData) {
      const filtered = adaptor._data.filter((item: any) => {
        return item.id === id
      })

      if (filtered.length > 0)
        filtered[0][fieldNm] = value
    }

    if (isData) {
      const filtered2 = adaptor.data.filter((item: any) => {
        return item.id === id
      })

      if (filtered2.length > 0)
        filtered2[0][fieldNm] = value
    }

    if (isViewData) {
      const filtered3 = adaptor.viewData.filter((item: any) => {
        return item.id === id
      })

      if (filtered3.length > 0)
        filtered3[0][fieldNm] = value
    }
  }

  getViewData(currentPage?: number, isFilter?: boolean) {
    // for tiled view
    const adaptor = this

    adaptor.loader = true
    console.log('getViewData........')
    currentPage
      = currentPage === undefined || currentPage === 0 ? 1 : currentPage
    adaptor.skip = (currentPage - 1) * adaptor.take

    if (isFilter) {
      setTimeout(() => {
        adaptor.loader = false

        const dataItems: any = process(adaptor.data, {
          // adaptor.data 필터된 결과로 페이징,정렬...처리
          take: adaptor.pageable ? adaptor.take : 0,
          skip: adaptor.pageable ? adaptor.skip : 999999999999,
          group: adaptor.group,
          sort: adaptor.sort,
        })

        /// /adaptor.data = adaptor._data
        adaptor.viewData = dataItems.data

        console.log('Adaptor getData...filter', adaptor.skip, adaptor.viewData)
      }, 50)
    }
    else {
      setTimeout(() => {
        adaptor.loader = false

        const dataItems: any = process(adaptor._data, {
          // adaptor._data 최초 데이터로 페이징,정렬...처리
          take: adaptor.pageable ? adaptor.take : 0,
          skip: adaptor.pageable ? adaptor.skip : 999999999999,
          group: adaptor.group,
          sort: adaptor.sort,
        })

        adaptor.data = adaptor._data
        adaptor.viewData = dataItems.data

        console.log('Adaptor getData...view', adaptor.skip, adaptor.viewData)
      }, 10)
    }
  }

  searchFilter(condition: any, isTiled?: boolean) {
    const adaptor = this
    const multiCodeFileds = adaptor.multiCodeFileds

    // multiCodeFileds.includes("aaa")

    // adaptor.filter.filters = []
    adaptor.filter = { logic: 'and', filters: [] }

    let count = 0
    for (const [k, v] of Object.entries(condition as any)) {
      const json: any = structuredClone(toRaw(v))
      const operator = condition[k].operator === undefined || condition[k].operator === '' ? 'eq' : condition[k].operator

      // console.log("kkkkkk", k, typeof(condition[k].value ), condition[k].value  )

      if (
        condition[k] !== undefined
        && condition[k].value !== null
        && condition[k].value
        && condition[k].value !== ''
      ) {
        if (condition[k].field.indexOf(';') > 0) { // 과제명 또는 과제코드
          // value는 string 으로 간주
          const fieldArr = condition[k].field.split(';')
          if (condition[k].value.length === 0) {
            continue
          }
          else {
            const conditonValue = String(condition[k].value)
            const multiCodeCond: any = { logic: 'or', filters: [] }

            for (let x = 0; x < fieldArr.length; x++) {
              multiCodeCond.filters.push({
                field: fieldArr[x],
                operator,
                value: conditonValue,
              })
            }

            adaptor.filter.filters.push(multiCodeCond)

            adaptor.filter.logic = 'and'
            count++
          }
        }
        else if (typeof condition[k].value === 'object') {
          if (condition[k].value.length === 0) {
            continue
          }
          else if (multiCodeFileds.includes(condition[k].field)) {
            // 조회조건이 멀티코드 / 데이터 필드 멀티코드
            const multiCodeCond: any = { logic: 'or', filters: [] }

            for (let x = 0; x < condition[k].value.length; x++) {
              multiCodeCond.filters.push({
                field: condition[k].field,
                operator(items: any, filterValue: string) {
                  if (items && items.length > 0 && filterValue) {
                    for (let i = 0; i < items.length; i++) {
                      if (items[i].toUpperCase() == filterValue.toUpperCase())
                        return true
                    }
                  }

                  return false
                },
                value: condition[k].value[x],
              })
            }

            adaptor.filter.filters.push(multiCodeCond)

            adaptor.filter.logic = 'and'
            count++
          }
          else {
            // 조회조건이 멀티코드  / 데이터 필드 단일코드
            const multiCodeCond: any = { logic: 'or', filters: [] }

            for (let x = 0; x < condition[k].value.length; x++) {
              const conditonValue = String(condition[k].value[x])

              multiCodeCond.filters.push({
                field: condition[k].field,
                operator,
                value: conditonValue,
              })
            }

            adaptor.filter.filters.push(multiCodeCond)

            adaptor.filter.logic = 'and'
            count++
          }
        }
        else {
          if (multiCodeFileds.includes(condition[k].field)) {
            // 필드가 멀티코드필드
            if (condition[k].value && condition[k].value !== '') {
              adaptor.filter.filters.push({
                field: condition[k].field,
                operator(items: any, filterValue: string) {
                  if (items && items.length > 0 && filterValue) {
                    for (let i = 0; i < items.length; i++) {
                      if (items[i].toUpperCase() == filterValue.toUpperCase())
                        return true
                    }
                  }

                  return false
                },
                value: condition[k].value,
              })
            }
          }
          else {
            if (condition[k].value && condition[k].value !== '') {
              const conditonValue = String(condition[k].value)

              adaptor.filter.filters.push({
                field: condition[k].field,
                operator,
                value: conditonValue,
              })
            }
          }

          adaptor.filter.logic = 'and'
          count++
        }
      }
    }

    if (adaptor.name === 'tree') {
      // grid {} / tree []
      adaptor.filter4Tree = [adaptor.filter]
    }

    if (adaptor.name === 'tree')
      console.log('searchFilterOn ############# ', adaptor.filter4Tree, isTiled)
    else
      console.log('searchFilterOn ############# ', adaptor.filter, isTiled)

    if (isTiled !== undefined && isTiled) {
      // 필터 --> VCustomPaging  filterWatcher4Tiled watchEffect
      console.log('searchFilterOncount4Tiled', this.filterWatcher4Tiled)
      this.filterWatcher4Tiled++
    }
    else if (adaptor.name.toUpperCase() === 'data'.toUpperCase()) {
      adaptor.refreshData4NoGrid()
    }
    else if (adaptor.name.toUpperCase() === 'tree'.toUpperCase()) {
      adaptor.refreshData4NoGrid()
    }
    else {
      adaptor._setDataPost = true
    }
  }

  refreshData4NoGrid = () => {
    // grid or tiled 와 연동되지 않는 데이터
    const adaptor = this

    console.log('refreshData4NoGrid 00', adaptor.viewData.length)
    console.log('refreshData4NoGrid 11', adaptor.filter)

    if (adaptor.filter)
      adaptor.data = filterBy(adaptor._data, adaptor.filter)
    else
      adaptor.data = [...adaptor._data]

    const filteredData = JSON.parse(JSON.stringify(adaptor.data))

    adaptor.group = adaptor.group

    // setTimeout(() => {
    const dataItems: any = process(filteredData, {
      take: adaptor.pageable ? adaptor.take : 999999999999,
      skip: adaptor.pageable ? adaptor.skip : 0,
      group: adaptor.group,
      sort: adaptor.sort,
    })

    adaptor.viewData = dataItems.data
    adaptor.componentKey++ // 화면에서..watching 안되네..
    console.log('refreshData4NoGrid 33', adaptor.viewData.length, adaptor.componentKey)

    // }, 10)
  }

  searchFilterClear(condition: any, isTiled?: boolean) {
    const adaptor = this
    let count = 0
    isTiled = isTiled === undefined ? false : isTiled

    for (const [k, v] of Object.entries(condition as any)) {
      const json: any = structuredClone(toRaw(v))

      if (json.defaultValue !== undefined) {
        condition[k].value = json.defaultValue
        count++
      }
      else {
        condition[k].value = null
      }
    }

    if (count > 0) {
      this.searchFilter(condition, isTiled)
    }
    else {
      adaptor.filter = { filters: [] }
      adaptor._setDataPost = true
    }
  }

  openDrawer(viewMode: string) {
    const adaptor = this

    if (viewMode === 'I')
      adaptor.clickItem = {}

    setTimeout(() => {
      // ### click event emit && drawer open delay
      adaptor.viewMode = viewMode
      adaptor.isDrawerOpen = true
    }, 100)
  }

  routeLink(name: string) {
    const adaptor = this
    const router = adaptor.router

    setTimeout(() => {
      // ### click event emit && drawer open delay
      console.log('routeLink adaptor.clickItem 00', adaptor.clickItem)
      router.push({ name, params: adaptor.clickItem })
    }, 100)
  }

  checkSelectOne(isMsg?: boolean) {
    const adaptor = this
    let succ = true
    isMsg = isMsg === undefined ? true : isMsg // alert 메세지 여부

    if (adaptor.selectedRows.length !== 1) {
      if (isMsg)
        PageUtils.alert('MSG.chkOne')
      succ = false
    }

    return succ
  }

  isChanged() {
    // grid 변경여부만 체크
    const adaptor = this
    let chgCnt = 0
    const compareKey = adaptor.keyField
    const object = adaptor.viewData
    const originObject = adaptor.data

    console.log('object.....', object)
    for (let i = 0; i < object.length; i++) {
      const id = object[i][compareKey]
      let isChangedRow = false
      console.log('id.....', i, id, compareKey)
      if (object[i]._rowType === 'I') {
        chgCnt++
        isChangedRow = true
      }
      else {
        const originItem = originObject.filter(
          (item: any) => item[compareKey] === id,
        )

        if (originItem === undefined || originItem.length === 0) {
          // id 필드를 변경하는 경우 데이터가 없을수 있다. 변경된것으로 간주
          chgCnt++
          isChangedRow = true
        }
        else if (PageUtils.isChange4Kendo(object[i], originItem[0])) {
          chgCnt++
          isChangedRow = true
        }
      }
    }

    // console.log("isChanged....1", chgCnt, adaptor.viewData)
    // console.log("isChanged....2", chgCnt, adaptor.data)
    if (chgCnt === 0)
      return false
    else
      return true
  }

  getChangedData() {
    // (주의) isExist4Save 이후에 사용할것.
    // 저장시 변경된 데이터만 추출
    const adaptor = this

    // let filtered = adaptor.viewData.filter((item: any, index: number) =>
    //   adaptor.changedRowsIndex.includes(index) // not used.....
    // )

    return adaptor.viewData.filter((item: any, index: number) =>
      adaptor.changedRowsUUID.includes(item.uuid), // latest
    )
  }

  isExist4Save() {
    // 데이터 변경여부
    const adaptor = this
    let chgCnt = 0
    const compareKey = adaptor.keyField
    const object = adaptor.viewData
    const originObject = adaptor.data

    if (!adaptor.editMode) {
      // alert("읽기전용모드입니다.");
      PageUtils.alert('MSG.chkReadonly')

      return false
    }

    if (Array.isArray(object) || Array.isArray(originObject)) {
      adaptor.changedRowsIndex = [] // not used...
      adaptor.changedRowsUUID = [] // latest
      for (let i = 0; i < object.length; i++) {
        const id = object[i][compareKey]
        let isChangedRow = false

        if (object[i]._rowType === 'I') {
          chgCnt++
          adaptor.changedRowsIndex.push(Number(object[i]._rn) - 1)
          adaptor.changedRowsUUID.push(object[i].uuid)
          isChangedRow = true
        }
        else {
          const originItem = originObject.filter(
            (item: any) => item[compareKey] === id,
          )

          if (originItem === undefined || originItem.length === 0) {
            // id 필드를 변경하는 경우 데이터가 없을수 있다. 변경된것으로 간주
            chgCnt++
            object[i]._rowType = 'U'
            adaptor.changedRowsIndex.push(Number(object[i]._rn) - 1)
            adaptor.changedRowsUUID.push(object[i].uuid)
            isChangedRow = true
          }
          else if (PageUtils.isChange4Kendo(object[i], originItem[0])) {
            chgCnt++
            object[i]._rowType = 'U'
            adaptor.changedRowsIndex.push(Number(object[i]._rn) - 1)
            adaptor.changedRowsUUID.push(object[i].uuid)
            isChangedRow = true
          }
          else {
            object[i]._rowType = ''
          }
        }
      }

      console.log('changedRows......', adaptor.changedRowsUUID)

      if (chgCnt === 0) {
        PageUtils.alert('MSG.noChangeData')

        return false
      }
      else {
        const validation = adaptor.validate()
        if (validation?.valid) {
          if (!PageUtils.confirm('MSG.cfmSave'))
            return false
        }
        else {
          return false
        }

        return true
      }
    }
    else {
      return PageUtils.isChange4Kendo(object, originObject)
    }
  }

  isExist4Del() {
    // 삭제대상 존재여부
    const adaptor = this

    if (!adaptor.editMode) {
      // alert("읽기전용모드입니다.");
      PageUtils.alert('MSG.chkReadonly')

      return false
    }

    // 신규행 제거 (삭제는 역순으로)
    const length = adaptor.viewData.length
    let newRows = 0
    for (let i = length - 1; i >= 0; i--) {
      const uuid = adaptor.viewData[i].uuid
      const rowType = adaptor.viewData[i]._rowType
      if (adaptor.selectedRows.includes(uuid) && rowType === 'I') {
        // 신규행
        adaptor.viewData.splice(i, 1)

        const filtered = adaptor.selectedRows.filter(
          (value: any, index: number) => {
            return value !== uuid
          },
        )

        adaptor.selectedRows = filtered

        newRows++
      }
    }

    console.log('isExist4Del....', newRows, adaptor.selectedRows)

    if (newRows > 0 && adaptor.selectedRows.length === 0) {
      // 삭제할 행 선택 확인
      console.log('신규행만 제거함....')

      // adaptor._templateRefresh = false; // template column refresh
      // setTimeout(function () {
      //  adaptor._templateRefresh = true;
      // }, 50);

      adaptor.componentKey++

      return false
    }
    else if (newRows === 0 && adaptor.selectedRows.length === 0) {
      // 삭제할 행 선택 확인
      // alert("삭제할 대상이 없습니다.");
      PageUtils.alert('MSG.noDelData')

      return false
    }
    else {
      if (!PageUtils.confirm('MSG.cfmDel'))
        return false // 삭제여부 확인
    }

    return true
  }

  getSelectedData() {
    // 삭제시 선택(체크)된 데이터만 추출
    const adaptor = this

    return adaptor.viewData.filter((item: any, index: number) =>
      adaptor.selectedRows.includes(item.uuid),
    )
  }

  exportExcel(fileName: string, data?: any) {
    // kendo grid 엑셀 다운로드
    saveExcel({
      data: data ? data : this.data,
      fileName,
      columns: this.columns,
    })
  }

  getFieldNm(e: any) {
    const adaptor = this

    const cellIndex = e.event.target.cellIndex
    let fieldNm = ''
    for (let i = 0; i < adaptor.columns.length; i++) {
      if (cellIndex === i) {
        fieldNm = adaptor.columns[i].field
        break
      }
    }

    return fieldNm
  }

  expandAll4Tree() {
    const adaptor = this

    // tree-list expanded..
    const data = adaptor.viewData

    // 전부 펼침
    for (let i = 0; i < data.length; i++)
      adaptor.expanded.push(data[i].id)
  }

  expandTop4Tree() {
    const adaptor = this
    const data = adaptor.viewData

    // 1레벨
    for (let i = 0; i < data.length; i++) {
      if (data[i].parentId === undefined || data[i].parentId === '') {
        adaptor.expanded = [data[i].id]
        break
      }
    }
  }

  toggleEditMode() {
    // 그리드 전체에 대해서.. view or editalbe 설정
    const adaptor = this

    // editalbe == true 상태에서 신규행 존재할 경우
    // const filtered = adaptor.viewData.filter((item:any) => {
    //   return item._rowType === "I"
    // })

    // if(filtered.length > 0){
    //   alert("처리되지 않은 행이 존재합니다.")
    //   return
    // }

    if (PageUtils.isChange4Grid(adaptor)) {
      // 변경여부 체크
      if (PageUtils.confirm('MSG.chkChange4Toggle'))
        adaptor.refreshViewData()
      else
        return
    }

    // grid column
    adaptor.editMode = !adaptor.editMode
    adaptor.componentKey++

    console.log('ToggleEditMode...000', adaptor.columns)
  }

  refreshViewData() {
    // for grid refresh 단순 새로고침용
    const adaptor = this

    adaptor.loader = true

    let currentPage = adaptor.currentPage

    currentPage = currentPage === undefined || currentPage === 0 ? 1 : currentPage
    adaptor.skip = (currentPage - 1) * adaptor.take

    setTimeout(() => {
      adaptor.loader = false

      const dataItems: any = process(adaptor._data, {
        take: adaptor.pageable ? adaptor.take : 999999999999,
        skip: adaptor.pageable ? adaptor.skip : 0,
        group: adaptor.group,
        sort: adaptor.sort,
      })

      adaptor.data = dataItems.data
      adaptor.viewData = dataItems.data

      // tree-list expand
      if (adaptor.name === 'tree') {
        if (adaptor.expandAll)
          adaptor.expandAll4Tree()
        else
          adaptor.expandTop4Tree()
      }

      adaptor._setDataPost = true

      console.log(
        'Adaptor refreshViewData...sort',
        adaptor.skip,
        adaptor.viewData,
      )
    }, 10)
  }

  setEditMode4Field(field: string, editable: boolean) {
    // not used...
    const adaptor = this

    for (let i = 0; i < adaptor.columns.length; i++) {
      const column = adaptor.columns[i]
      if (column.field === field)
        column._editable = editable
    }

    adaptor.componentKey++
    console.log('setEditMode4Field...000', adaptor.columns)
  }

  addRow() {
    // grid toolbar add버튼이 아닌 스크립트로 행추가시 사용
    const adaptor = this

    adaptor._addRowCnt++ // VCustomGrid watchEffect 호출
  }

  validate() {
    const adaptor = this
    let succ = true
    let msg = ''
    const object = adaptor.viewData

    const filtered = adaptor.viewData.filter((item: any) => {
      return item._rowType === 'I' || item._rowType === 'U' // insert or upadate
    })

    const colums = adaptor.columns
    const requiredField: any = []
    const requiredTitle: any = []
    const requiredDataType: any = []

    const numberLimitField: any = []
    for (let i = 0; i < colums.length; i++) {
      const required
        = colums[i]._required === undefined ? false : colums[i]._required

      if (required) {
        requiredField.push(colums[i].field)
        requiredTitle.push(colums[i].title)
        requiredDataType.push(colums[i].cell)
      }

      if (colums[i]._max !== undefined || colums[i]._min !== undefined)
        numberLimitField.push(colums[i])
    }

    for (let i = 0; i < filtered.length; i++) {
      const rn = filtered[i]._rn

      // 10. 필수체크
      for (let k = 0; k < requiredField.length; k++) {
        const value = filtered[i][requiredField[k]]
        const type = requiredDataType[k]

        if (type === KTEMPLATE.NUMBER) {
          if (value === undefined || value === '' || Number(value) === 0) {
            let chkMsg = useCodeStore().Dic('VALID.required')
            chkMsg = chkMsg
              .replace('_RN', rn)
              .replace('_FIELD', requiredTitle[k])
            msg += `${chkMsg}\r`

            // alert(msg)
            succ = false
            break

            // return {valid: succ, msg: msg}
          }
        }
        else {
          if (value === undefined || value === '') {
            let chkMsg = useCodeStore().Dic('VALID.required')
            chkMsg = chkMsg
              .replace('_RN', rn)
              .replace('_FIELD', requiredTitle[k])
            msg += `${chkMsg}\r`

            // alert(msg)
            succ = false
            break

            // return {valid: succ, msg: msg}
          }
        }
      }

      // 20. max, min value
      for (let k = 0; k < numberLimitField.length; k++) {
        const value = filtered[i][numberLimitField[k].field]

        const maxLimit
          = numberLimitField[k]._max === undefined
            ? 999999999999
            : numberLimitField[k]._max

        const minLimit
          = numberLimitField[k]._min === undefined
            ? -999999999999
            : numberLimitField[k]._min

        if (!(value >= minLimit && value <= maxLimit)) {
          let chkMsg = ''
          if (
            numberLimitField[k]._max === undefined
            && numberLimitField[k]._min !== undefined
          ) {
            chkMsg = useCodeStore().Dic('VALID.min')
            chkMsg = chkMsg
              .replace('_RN', rn)
              .replace('_FIELD', numberLimitField[k].title)
              .replace('(1)', minLimit)
          }
          else if (
            numberLimitField[k]._max !== undefined
            && numberLimitField[k]._min === undefined
          ) {
            chkMsg = useCodeStore().Dic('VALID.max')
            chkMsg = chkMsg
              .replace('_RN', rn)
              .replace('_FIELD', numberLimitField[k].title)
              .replace('(1)', maxLimit)
          }
          else {
            chkMsg = useCodeStore().Dic('VALID.maxMin')
            chkMsg = chkMsg
              .replace('_RN', rn)
              .replace('_FIELD', numberLimitField[k].title)
              .replace('(1)', minLimit)
              .replace('(2)', maxLimit)
          }

          msg += `${chkMsg}\r`

          // alert(msg)
          succ = false
          break
        }
      }
    }

    if (msg !== '')
      alert(msg)

    return { valid: succ, msg }
  }

  test() {
    console.log(`${this.name} is walking.`)
  }
}
