<template>
  <v-card-title>
    <v-row justify="center">
      <v-col cols="12" class="d-flex align-center justify-center">
        <p>Chọn khoảng thời gian theo ngày tạo gói khám</p>
      </v-col>
    </v-row>
    <a-row class="d-flex align-center justify-center mb-8">
      <a-col>
        <!-- v-text-field đóng vai trò input để kích hoạt v-date-picker -->
        <a-range-picker
          v-model:value="selectedDate"
          format="DD-MM-YYYY"
          @change="changeDates"
        >
          <template #dateRender="{ current }">
            <div
              class="ant-picker-cell-inner"
              :style="getCurrentStyle(current)"
            >
              {{ current.date() }}
            </div>
          </template>
        </a-range-picker>
      </a-col>
      <a-col class="ml-8">
        <a-button type="primary" @click="fetchData"> Lấy dữ liệu </a-button>
      </a-col>
    </a-row>

    <!-- table danh sách hẹn khám -->
    <v-row>
      <v-col>DANH SÁCH HẸN KHÁM</v-col>
      <v-col class="d-flex justify-end align-end">
        <a-button @click="exportToExcel"> Xuất excel </a-button>
      </v-col>
      <!-- <v-col class="d-flex justify-end align-end">
        <a-button @click="getFilteredData" color="primary"> Lấy dữ liệu sau search </a-button>
      </v-col> -->
    </v-row>
    <v-row>
      <v-col>
        <a-input-search
          v-model:value="search"
          placeholder="Search"
          itemtype=""
        />
      </v-col>
    </v-row>
    <v-spacer></v-spacer>
  </v-card-title>
  <v-data-table
    :style="dataTableStyle()"
    :headers="headers"
    :items="patients_"
    :search="search"
    :loading="fetching"
  >
    <template v-slot:item.is_mess_sent="{ item }">
      <v-checkbox
        v-model="item.is_mess_sent"
        hide-details
        readonly
      ></v-checkbox>
    </template>

    <template v-slot:item.is_appointment="{ item }">
      <v-checkbox
        v-model="item.is_appointment"
        hide-details
        readonly
        class="d-flex justify-center"
      ></v-checkbox>
      <div
        v-if="item.is_appointment"
        class="text-center"
        style="padding-bottom: 12px"
      >
        <v-chip
          color="black"
          :text="`${filtersStore.DataDateToValDate(
            item.appointment?.schedule?.date
          )} - Ca ${item.appointment?.session?.name} (${
            store.data.shift[Number(item.appointment?.session?.name) - 1]?.time
          })`"
          size="x-small"
          label
        ></v-chip>
      </div>
    </template>

    <template v-slot:item.checkin_date="{ item }">
      <div v-if="item.checkin_date" class="text-end">
        <v-chip
          color="green"
          :text="item.checkin_date"
          class="text-uppercase"
          size="small"
          label
        ></v-chip>
      </div>
    </template>

    <template v-slot:item.checkout_date="{ item }">
      <div v-if="item.checkout_date" class="text-end">
        <v-chip
          color="green"
          :text="item.checkout_date"
          class="text-uppercase"
          size="small"
          label
        ></v-chip>
      </div>
    </template>
    <template v-slot:no-data>
      <!-- <v-btn color="primary"> Reset </v-btn> -->
      <span style="color: gray"> Chưa có dữ liệu... </span>
    </template>
  </v-data-table>

  <!-- loader -->

  <!-- circle-load -->
  <v-dialog persistent v-model="circle_loader.state">
    <v-card
      class="mx-auto ma-2 pa-2"
      style="background-color: rgba(255, 255, 255, 0.6)"
    >
      <div>
        <v-progress-circular :size="50" color="green" indeterminate>
          <v-icon v-if="circle_loader.icon">{{ circle_loader.icon }}</v-icon>
        </v-progress-circular>
      </div>
    </v-card>
  </v-dialog>

  <!-- single-circle-load -->
  <v-dialog persistent v-model="single_circle_loader.state">
    <v-card
      class="mx-auto ma-2 pa-2"
      style="background-color: rgba(112, 171, 78, 0.85)"
    >
      <div>
        <v-row justify="center" style="margin: 1rem">
          <v-col
            v-if="single_circle_loader.title"
            cols="12"
            style="text-align: center; color: white"
            >{{ single_circle_loader.title }}</v-col
          >
          <v-col cols="12" style="text-align: center">
            <v-progress-circular
              :size="70"
              :width="7"
              color="white"
              indeterminate
            >
              <v-icon v-if="this.circle_loader.icon">{{
                single_circle_loader.icon
              }}</v-icon>
            </v-progress-circular>
          </v-col>
        </v-row>
      </div>
    </v-card>
  </v-dialog>

  <Snackbar />
  <ProgressCircular />
  <SingleProgressCircular />
</template>

<script>
import axios from "axios";
import { useFiltersStore } from "~/store/index.ts";
import { storeToRefs } from "pinia";
import Snackbar from "../utilities/Snackbar.vue";
import ProgressCircular from "../utilities/ProgressCircular.vue";
import SingleProgressCircular from "../utilities/SingleProgressCircular.vue";
import * as XLSX from "xlsx";
export default {
  name: "PatientPage",
  props: {
    // pack_info: {},
    pack_id: {},
    is_follow_pack: false,
  },
  components: {
    Snackbar,
    ProgressCircular,
    SingleProgressCircular,
  },
  data() {
    return {
      // rule

      // ===rules
      phoneNumberRule: [
        (v) => {
          if (v) {
            if (/^[Z0-9-()]+(\s+[Z0-9-()]+)*$/.test(v)) {
              if (v[0] === "0" && (v.length === 11 || v.length === 10)) {
                return true;
              }
              return "sdt phải có 10 số. Vd: 07012345678";
            } else {
              return "Không được có khoảng trắng và kí tự";
            }
          }
          return true;
        },
      ],
      emailRules: [
        (v) =>
          !v ||
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,4})+$/.test(v) ||
          "email phải đúng định dạng. vd: nvmau@gmail.com",
      ],

      // loader
      circle_loader: {
        state: false,
        icon: "",
      },
      single_circle_loader: {
        state: false,
        icon: "",
        title: "",
      },

      isDatePickerActive: false, // Kiểm soát hiển thị của v-date-picker
      selectedDate: [], // Lưu mảng ngày đã chọn
      formattedDate: "", // Chuỗi hiển thị định dạng "ngày - ngày"
      rangeDate: {
        startDate: "",
        endDate: "",
      },

      // orther
      url: null,
      fetching: false,
      store: storeToRefs(useFiltersStore()),
      filtersStore: useFiltersStore(),
      overlay: false,
      formTitle: null,

      dialog: false,
      dialogSeenItem: false,
      dialogDelete: false,
      dialogUpdateOrNotic: false,
      dialogAcceptSendMultiSMS: false,
      dialogChooseSendMultiple: false,
      dialogCanNotChooseSendMultiple: false,

      type_send_multiple: null,
      search: "",
      editedIndex: -1,
      editedItem: {
        stt: null,
        id: null,
        fullname: null,
        birthday: null,
        email: null,
        phone_number: null,
        date: null,
        session_name: null,
        pack_id: null,
        session_id: null,
        appointment: null,
      },
      defaultItem: {
        stt: null,
        id: null,
        fullname: null,
        birthday: null,
        email: null,
        phone_number: null,
        date: null,
        session: null,
        pack_id: null,
        session_id: null,
        session_name: null,
        appointment: null,
      },
      session_packs_: [
        {
          pack_id: null,
          session_id: null,
          session_name: null,
          date: null,
          session_slots: 0,
          registered_patients: 0,
        },
      ],
      edited_session_packs_: [
        {
          pack_id: null,
          session_id: null,
          session_name: null,
          date: null,
          session_slots: 0,
          registered_patients: 0,
        },
      ],
      headers: [
        {
          align: "start",
          key: "stt",
          sortable: false,
          title: "STT",
        },
        { key: "company.name", title: "Tên công ty" },
        { key: "fullname", title: "Tên khách hàng" },
        { key: "is_mess_sent", title: "Đã gửi tin" },
        { key: "is_appointment", title: "Đã đặt lịch", align: "center" },
        { key: "checkin_date", title: "Ngày tới khám" },
        { key: "checkout_date", title: "Ngày hoàn thành khám" },
        // { title: "Actions", key: "actions", sortable: false },
        // { title: "ActionsLH", key: "actionsLH", sortable: false },
      ],
      patients_: [],
    };
  },
  async mounted() {
    this.fetchHeader();
  },

  watch: {
    dialog(newVal, oldVal) {
      if (newVal === false) {
        this.close();
      }
    },

    dialogSeenItem(newVal, oldVal) {
      if (newVal === false) {
        this.closeSeenItem();
      }
    },

    dialogDelete(newVal, oldVal) {
      if (newVal === false) {
        this.closeDelete();
      }
    },
  },

  computed: {
    filteredPatients() {
      if (!this.search) return this.patients_;
      return this.patients_.filter((item) => {
        const searchLower = this.search.toLowerCase();
        return this.flattenValues(item).some((value) =>
          String(value).toLowerCase().includes(searchLower)
        );
      });
    },
  },
  methods: {
    // Lấy dữ liệu theo chuỗi search
    getFilteredData() {
      console.log("Dữ liệu sau search:", this.filteredPatients);
    },

    // 🔥 Hàm đệ quy để lấy tất cả giá trị của đối tượng/mảng
    flattenValues(obj) {
      let values = [];

      if (Array.isArray(obj)) {
        obj.forEach((item) => values.push(...this.flattenValues(item)));
      } else if (typeof obj === "object" && obj !== null) {
        Object.values(obj).forEach((value) =>
          values.push(...this.flattenValues(value))
        );
      } else {
        values.push(obj);
      }

      return values;
    },

    // 📥 Xuất danh sách bệnh nhân sau khi search ra Excel
    async exportToExcel() {
      let searchedPatients = this.filteredPatients;
      if (searchedPatients.length === 0) {
        alert("Không có dữ liệu để xuất!");
        return;
      }
      for (let index = 0; index < searchedPatients.length; index++) {
        searchedPatients[index].is_right_time = false;
        const item = searchedPatients[index];
        if (
          item.appointment.schedule.date &&
          item.appointment.session.name &&
          item.checkin_date
        ) {
          searchedPatients[index].appointment_times =
            this.store.data.shift[
              Number(item.appointment.session.name) - 1
            ].time;
          const appointment_times =
            searchedPatients[index].appointment_times.split(" - ");
          let true_time_start = [];
          let true_time_end = [];
          if (appointment_times.length === 2) {
            true_time_start = appointment_times[0].split(":").map(Number);
            true_time_end = appointment_times[1].split(":").map(Number);
          }

          let patient_time_in = [];
          if (true_time_start.length === 2 && true_time_end.length === 2) {
            patient_time_in = String(item.checkin_date).split(" ");
            console.log("patient_time_in", patient_time_in);
          }
          if (
            patient_time_in.length === 2 &&
            this.cmpTrueDate_ArrivalDate(
              item.appointment.schedule.date,
              patient_time_in[0]
            ) &&
            this.cmpTrueTime_ArrivalTime(
              true_time_start,
              true_time_end,
              patient_time_in[1]
            )
          ) {
            searchedPatients[index].is_right_time = true;
          }
        }
      }
      // Chuyển dữ liệu từ đối tượng lồng nhau thành dạng phẳng
      const data = searchedPatients.map((item) => ({
        "Mã số y tế": item.medical_code,
        "Họ Tên": item.fullname,
        "Ngày sinh": item.birthday
          ? this.filtersStore.DateToExcelSerial(
              this.filtersStore.DataDateToValDate(item.birthday)
            )
          : "",
        "Điện thoại": item.phone_number,
        Email: item.email,
        "Đã gửi tin": item.is_mess_sent,
        "Đã đặt lịch": item.is_appointment,
        "Ngày đặt lịch": item.appointment.schedule.date
          ? this.filtersStore.DateToExcelSerial(
              this.filtersStore.DataDateToValDate(
                item.appointment.schedule.date
              )
            )
          : "",
        "Giờ đặt lịch": item.appointment_times,
        "Giờ check in": item.checkin_date,
        "Tới đúng lịch": item.is_right_time,
        "Giờ check out": item.checkout_date,
        // "": item.history.join(", "), // Nếu là mảng thì nối chuỗi
      }));

      // Tạo workbook và worksheet
      const ws = XLSX.utils.json_to_sheet(data);

      // Xác định cột "Ngày Sinh"
      const headers = Object.keys(data[0]);
      const dateColumnIndex = headers.indexOf("Ngày sinh");
      const dateColumnIndex2 = headers.indexOf("Ngày đặt lịch");

      if (dateColumnIndex !== -1 && dateColumnIndex2 !== -1) {
        const range = XLSX.utils.decode_range(ws["!ref"]);
        for (let R = 1; R <= range.e.r; ++R) {
          const cell_address = XLSX.utils.encode_cell({
            r: R,
            c: dateColumnIndex,
          });
          const cell_address2 = XLSX.utils.encode_cell({
            r: R,
            c: dateColumnIndex2,
          });

          // Nếu ô trống, tạo ô mới
          if (!ws[cell_address]) {
            ws[cell_address] = { t: "n", v: "" }; // t: "n" (number), v: "" (trống)
          }

          // Nếu ô trống, tạo ô mới
          if (!ws[cell_address2]) {
            ws[cell_address2] = { t: "n", v: "" }; // t: "n" (number), v: "" (trống)
          }

          // Áp dụng định dạng ngày
          ws[cell_address].z = "dd/mm/yyyy";
          ws[cell_address2].z = "dd/mm/yyyy";
        }
      }

      const wb = XLSX.utils.book_new();
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
      const yyyy = today.getFullYear();

      const formattedDate = `${dd}-${mm}-${yyyy}`;
      XLSX.utils.book_append_sheet(wb, ws, "Danh sách bệnh nhân");

      // Xuất file
      XLSX.writeFile(wb, `danh_sach_benh_nhan(${formattedDate}).xlsx`);
    },

    cmpTrueDate_ArrivalDate(true_date, visit_date) {
      console.log("true_date", true_date);
      console.log("visit_date", visit_date);

      const [t_yyyy, t_mm, t_dd] = new Date(true_date)
        .toISOString()
        .split("T")[0]
        .split("-");

      const [v_dd, v_mm, v_yyyy] = visit_date.split("-");

      if (t_dd === v_dd && t_mm === v_mm && t_yyyy === v_yyyy) {
        return true;
      } else {
        console.log("t_dd === v_dd", t_dd === v_dd);
        console.log("t_mm === v_mm", t_mm === v_mm);
        console.log("t_yyyy === v_yyyy", t_yyyy === v_yyyy);
        return false;
      }
    },

    cmpTrueTime_ArrivalTime(true_time_start, true_time_end, visit_time) {
      const [t_hh_start, t_mm_start] = true_time_start;
      const [t_hh_end, t_mm_end] = true_time_end;
      const [v_hh, v_mm] = visit_time.split(":").map(Number); // Bỏ SS

      // Chuyển tất cả về phút để so sánh
      const startMinutes = t_hh_start * 60 + t_mm_start;
      const endMinutes = t_hh_end * 60 + t_mm_end;
      const visitMinutes = v_hh * 60 + v_mm;

      return visitMinutes >= startMinutes && visitMinutes <= endMinutes;
    },

    // Đối ngày
    changeDates() {
      console.log(
        "khoảng thời gian chọn: ",
        this.formatDate(new Date(this.selectedDate[0]))
      );
      console.log("this.selectedDate?.length", this.selectedDate?.length);

      if (this.selectedDate?.length === 2) {
        if (
          this.saveDate([
            new Date(this.selectedDate[0]),
            new Date(this.selectedDate[1]),
          ])
        ) {
          this.checkRangeDate([
            new Date(this.selectedDate[0]),
            new Date(this.selectedDate[1]),
          ]);
        }
      } else {
        console.log("định dạng ngày không hợp lệ: ", this.selectedDate);
      }
    },

    getCurrentStyle(current) {
      const style = {};
      if (current.date() === 1) {
        style.border = "1px solid #1890ff";
        style.borderRadius = "50%";
      }
      return style;
    },

    // Kiểm tra quá 3 tháng
    isDateDifferenceGreaterThan3Months(date1, date2) {
      const startDate = new Date(date1);
      const endDate = new Date(date2);
      // console.log("startDate", Number(startDate));

      // Tính chênh lệch giữa hai ngày bằng milliseconds
      const differenceInTime = Math.abs(endDate - startDate);

      // Đổi milliseconds thành số ngày
      const differenceInDays = differenceInTime / (1000 * 60 * 60 * 24);

      return differenceInDays > 90;
    },

    // Kiểm tra và đổ giá trị ngày
    checkRangeDate(arrRange) {
      // const tempDates = strRange.length > 0 ? strRange.split("-") : [];
      if (arrRange?.length === 2) {
        const tempStart = this.formatDate(arrRange[0]).trim().split("/");
        const tempEnd = this.formatDate(arrRange[1]).trim().split("/");
        const startDay = `${tempStart[2]}-${tempStart[1]}-${tempStart[0]}`;
        const endDay = `${tempEnd[2]}-${tempEnd[1]}-${tempEnd[0]}`;
        if (this.isDateDifferenceGreaterThan3Months(startDay, endDay)) {
          console.log("Khoảng cách ngày phải nhỏ hơn 3 tháng!");
        } else if (tempStart?.length === 3 && tempEnd?.length === 3) {
          this.rangeDate = {
            startDate: startDay,
            endDate: endDay,
          };
        }
        console.log(`this.rangeDate:`, this.rangeDate);
      } else {
        console.log("Invalid range date!");
      }
    },

    // Đóng bảng ngày
    closeDatePicker() {
      this.selectedDate = null;
      this.isDatePickerActive = false;
    },

    // Phương thức lưu ngày đã chọn
    saveDate(dates) {
      if (dates.length > 0) {
        const firstDate = dates[0];
        const lastDate = dates[dates.length - 1];
        // Kiểm tra nếu khoảng cách lớn hơn 3 tháng
        if (this.isMoreThanThreeMonths(firstDate, lastDate)) {
          this.store.state.snackbar = this.store.state.snackbar_default;
          this.store.state.snackbar.text = `Khoảng thời gian không được vượt quá 3 tháng!`;
          this.store.state.snackbar.state = true;
          console.log("vượt 3 tháng!", this.store.state.snackbar);

          this.selectedDate = []; // Xóa ngày đã chọn nếu vượt quá giới hạn
          return false;
        } else {
          console.log("Khoảng cách ngày hợp lệ!");
          return true;
        }
      } else {
        console.log("Chưa chọn ngày!"); // Nếu không chọn ngày, để chuỗi rỗng
        return false;
      }
    },

    // kiểm tra quá 3 tháng
    isMoreThanThreeMonths(start, end) {
      const threeMonthsInMilliseconds = 3 * 30 * 24 * 60 * 60 * 1000; // Khoảng 10 ngày
      return end - start > threeMonthsInMilliseconds;
    },

    // Phương thức định dạng ngày
    formatDate(date) {
      if (!date) return "";
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Tháng 0-11 nên cộng 1
      const year = date.getFullYear();
      return `${day}/${month}/${year}`; // Trả về định dạng DD/MM/YYYY
    },

    // Chọn gửi nhiều tin (hàm dư)
    chooseSendMultiple(type) {
      this.type_send_multiple = type;
      this.dialogAcceptSendMultiSMS = true;
    },

    // Kiểm tra header bảng
    fetchHeader() {
      if (
        this.store.data.user.permission !== "admin" &&
        this.store.data.user.permission !== "KD"
      ) {
        console.log("true");
        this.headers = this.headers.filter(
          (header) => header.key !== "actions"
        );
        console.log(this.headers);
      } else if (this.store.data.user.permission === "KD") {
        this.headers = this.headers.filter(
          (header) => header.key !== "actionsLH"
        );
      }
    },
    async fetchData() {
      if (!(this.rangeDate?.startDate && this.rangeDate?.startDate)) {
        this.store.state.snackbar = this.store.state.snackbar_default;
        this.store.state.snackbar.text = `Vui lòng chọn khoảng thời gian!`;
        this.store.state.snackbar.state = true;
        console.log("Chưa có khoảng thời gian!");
      } else {
        this.fetching = true;
        this.circle_loader.icon = "mdi-account-box";
        this.circle_loader.state = true;
        console.log("this.rangeDate", this.rangeDate);

        const headers = {
          authentication: localStorage.getItem("loginToken")
            ? localStorage.getItem("loginToken")
            : "",
        };
        let response = null;
        // xem danh sách báo cáo đặt hẹn
        if (
          this.store.data.user.permission === "admin" ||
          this.store.data.user.permission === "LH"
        ) {
          response = await axios
            .get(
              `${useRuntimeConfig().public.DOMAIN}/select-appointment-report`,
              {
                params: {
                  headers,
                  rangeDate: this.rangeDate,
                },
              }
            )
            .catch((e) => {
              console.log("không có data", e);
            });
        }
        // manager xem bệnh nhân
        else if (this.store.data.user.permission === "KD") {
          response = await axios
            .get(
              `${
                useRuntimeConfig().public.DOMAIN
              }/select-appointment-report-manager`,
              {
                params: {
                  headers,
                  rangeDate: this.rangeDate,
                  user: this.store.data.user,
                },
              }
            )
            .catch((e) => {
              console.log("không có data", e);
            });
        }
        if (response) {
          console.log("response.data", response.data);
          this.patients_ = [];
          if (response.data?.his_ace_patients?.length > 0) {
            const tempPatients = response.data.his_ace_patients;
            let stt = 0;
            // thực hiện gán giá trị cho mảng patient_ và session_pack_
            for (let index = 0; index < tempPatients.length; index++) {
              let tempPatient = {
                stt: ++stt,
                id: tempPatients[index].id ? tempPatients[index].id : null,
                medical_code: tempPatients[index].medical_code,
                birthday: tempPatients[index].birthday,
                phone_number: tempPatients[index].phone_number,
                email: tempPatients[index].email,
                fullname: tempPatients[index].fullname
                  ? tempPatients[index].fullname
                  : null,
                company: {
                  id: tempPatients[index].company_service_pack?.company?.id
                    ? tempPatients[index].company_service_pack?.company.id
                    : null,
                  name: tempPatients[index].company_service_pack?.company?.name
                    ? tempPatients[index].company_service_pack?.company.name
                    : null,
                },
                is_mess_sent:
                  tempPatients[index].is_mess_sent === 1 ? true : false,
                is_appointment:
                  tempPatients[index].appointment_session?.id &&
                  tempPatients[index].appointment_session?.appointment_schedule
                    ?.id
                    ? true
                    : false,
                appointment: {
                  session: {
                    id: tempPatients[index].appointment_session?.id
                      ? tempPatients[index].appointment_session.id
                      : null,
                    name: tempPatients[index].appointment_session?.name
                      ? tempPatients[index].appointment_session.name
                      : null,
                  },
                  schedule: {
                    id: tempPatients[index].appointment_session
                      ?.appointment_schedule?.id,
                    date: tempPatients[index].appointment_session
                      ?.appointment_schedule?.date,
                  },
                },
                checkin_date: tempPatients[index].checkin_date
                  ? this.filtersStore.TimestampToValDate(
                      tempPatients[index].checkin_date
                    )
                  : null,
                checkout_date: tempPatients[index].checkout_date
                  ? this.filtersStore.TimestampToValDate(
                      tempPatients[index].checkout_date
                    )
                  : null,
              };
              this.patients_.push(tempPatient);
            }
            console.log("this.patients_", this.patients_);
          }
        }
        this.circle_loader.state = false;
        this.circle_loader.icon = "";
        this.fetching = false;
      }
    },

    dataTableStyle() {
      if (this.store.state.isLogin) {
        this.display_style = "block";
      } else {
        this.display_style = "none";
      }
      return `display: ${this.display_style};
      ${this.is_follow_pack ? "background-color: #cedee7" : ""}`;
    },
    skeletonStyle() {
      return `${this.is_follow_pack ? "background-color: #cedee7" : ""}`;
    },

    addPatient() {
      this.formTitle = "Thêm";
      this.dialog = true;
    },

    labelWithFormatting(item) {
      return `${item.date}&ensp;-&ensp;Ca ${item.session_name}(${
        this.store.data.shift[Number(item.session_name) - 1]?.time
      })&ensp;-&ensp;${item.registered_patients}/${item.session_pack_slots}`;
    },

    close() {
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeSeenItem() {
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    deleteItem(item) {
      this.editedIndex = this.patients_.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
  },
};
</script>

<style scoped>
.btn_add_schedule {
  background: linear-gradient(to left, #c1cbd1, #ffffff, #c1cbd1);
}
.col-style {
  margin-top: -35px;
}
.v-progress-circular {
  margin: 1rem;
}
</style>