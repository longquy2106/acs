<template>
  <v-skeleton-loader
    v-if="circle_loader.state"
    class="mx-auto ma-2"
    elevation="12"
    max-width="100%"
    type="subtitle, table"
  ></v-skeleton-loader>
  <v-card-title v-if="!circle_loader.state" style="background-color: #cedee7">
    <v-row>
      <v-col style="font-size: 15px"> DANH SÁCH BỆNH NHÂN</v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          variant="outlined"
          color="light-blue-accent-3"
          single-line
          hide-details
        ></v-text-field>
      </v-col>
      <!-- <v-col cols="auto" style="text-align: right">
        <v-btn color="primary" dark class="mb-2" @click="addPatient">
          Thêm bệnh nhân
        </v-btn>
      </v-col> -->
    </v-row>
    <v-spacer></v-spacer>
  </v-card-title>
  <v-data-table
    v-if="!circle_loader.state"
    :style="isDisable()"
    :headers="headers"
    :items="patients_"
    :search="search"
    style="background-color: #cedee7"
  >
    <template v-slot:item.actions="{ item }">
      <!-- <v-tooltip text="Tạo gói khám">
        <template v-slot:activator="{ props }">
          <v-icon
            v-bind="props"
            size="small"
            class="me-2"
            @click="addPackage(item)"
          >
            mdi-medical-bag
          </v-icon>
        </template>
      </v-tooltip> -->
      <v-icon size="small" class="me-2" @click="editItem(item)">
        mdi-pencil
      </v-icon>
      <v-icon size="small" @click="deleteItem(item)"> mdi-delete </v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary"> Reset </v-btn>
    </template>
  </v-data-table>

  <!-- Dialog chỉnh sửa dữ liệu bệnh nhân -->
  <v-dialog v-model="dialog" max-width="700px">
    <v-card>
      <v-card-text>
        <v-container>
          <v-row justify="center">
            <v-col style="text-align: center">
              <h3 style="color: #9b735e">
                {{ formTitle }} thông tin bệnh nhân
              </h3>
            </v-col>
          </v-row>
          <v-row class="ma-2" justify="center">
            <v-col cols="12">
              <v-text-field
                v-model="editedItem.fullname"
                variant="outlined"
                color="#9b735e"
                label="Tên bệnh nhân"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="12" md="6" class="col-style">
              <v-text-field
                v-model="editedItem.phone_number"
                variant="outlined"
                color="#9b735e"
                label="Số điện thoại"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="12" md="6" class="col-style">
              <v-text-field
                v-model="editedItem.birthday"
                variant="outlined"
                color="#9b735e"
                label="Ngày sinh"
              ></v-text-field>
            </v-col>
            <v-col cols="12" class="col-style">
              <v-text-field
                v-model="editedItem.email"
                variant="outlined"
                color="#9b735e"
                label="Email"
              ></v-text-field>
            </v-col>
            <v-col cols="12" class="check-box-col">
              <v-radio-group
                v-model="editedItem.session_id"
                style="margin-top: -30px"
              >
                <span v-for="(item, i) in edited_session_packs_" :key="i">
                  <v-radio
                    :disabled="
                      item.registered_patients >= item.session_pack_slots
                    "
                    :label="`${item.date}&ensp;-&ensp;Buổi&nbsp;${item.session_name}&ensp;-&ensp;${item.registered_patients}/${item.session_pack_slots}`"
                    :value="item.session_id"
                  ></v-radio>
                </span>
              </v-radio-group>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
          Cancel
        </v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="save()">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog xác nhận xóa thông tin công ty -->
  <v-dialog v-model="dialogDelete" max-width="50vw">
    <v-card>
      <v-card-text class="text-h7">
        <v-row justify="center" style="text-align: center">
          Bạn có chắc xóa bệnh nhân&nbsp;<b>{{ editedItem.fullname }}</b
          >&nbsp;ra khỏi dữ liệu?
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="dialogDelete = false"
          >Cancel</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm"
          >OK</v-btn
        >
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- circle-load -->
  <v-dialog persistent v-model="circle_loader.state">
    <v-card
      class="mx-auto ma-2 pa-2"
      style="background-color: rgba(255, 255, 255, 0.6)"
    >
      <div>
        <v-progress-circular :size="70" :width="7" color="green" indeterminate>
          <v-icon v-if="circle_loader.icon">{{ circle_loader.icon }}</v-icon>
        </v-progress-circular>
      </div>
    </v-card>
  </v-dialog>

  <!-- single-circle-load -->
  <v-dialog persistent v-model="this.single_circle_loader.state">
    <v-card
      class="mx-auto ma-2 pa-2"
      style="background-color: rgba(112, 171, 78, 0.85)"
    >
      <div>
        <v-row justify="center" style="margin: 1rem">
          <v-col
            v-if="this.single_circle_loader.title"
            cols="12"
            style="text-align: center; color: white"
            >{{ this.single_circle_loader.title }}</v-col
          >
          <v-col cols="12" style="text-align: center">
            <v-progress-circular
              :size="70"
              :width="7"
              color="white"
              indeterminate
            >
              <v-icon v-if="this.circle_loader.icon">{{
                this.single_circle_loader.icon
              }}</v-icon>
            </v-progress-circular>
          </v-col>
        </v-row>
      </div>
    </v-card>
  </v-dialog>

  <!-- loader -->
  <Snackbar />
</template>

<script>
import axios from "axios";
import { useFiltersStore } from "~/store/index.ts";
import { storeToRefs } from "pinia";
import Snackbar from "../utilities/Snackbar.vue";
export default {
  name: "PatientPage",
  props: {
    pack_id: {},
  },
  components: {
    Snackbar,
  },
  data() {
    return {
      store: storeToRefs(useFiltersStore()),
      filtersStore: useFiltersStore(),
      overlay: false,
      formTitle: null,
      dialog: false,
      dialogDelete: false,
      search: "",
      editedIndex: -1,

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
        { key: "fullname", title: "Họ tên" },
        { key: "birthday", title: "Ngày sinh" },
        { key: "email", title: "Email" },
        { key: "phone_number", title: "Số điện thoại" },
        { key: "appointment", title: "Ngày khám" },
        { title: "Actions", key: "actions", sortable: false },
      ],
      patients_: [],
    };
  },
  async mounted() {
    await this.fetchFirstData();
  },

  watch: {
    dialog(newVal, oldVal) {
      if (newVal === false) {
        this.close();
      }
    },

    dialogDelete(newVal, oldVal) {
      if (newVal === false) {
        this.closeDelete();
      }
    },
  },

  methods: {
    async fetchFirstData() {
      this.circle_loader.icon = "mdi-account-box";
      this.circle_loader.state = true;
      console.log("alo alo");
      //   const currentYear = new Date().getFullYear();
      //   console.log("date", currentYear);
      await axios
        .get(`${useRuntimeConfig().public.DOMAIN}/select-patients-of-pack`, {
          params: { pack_id: this.pack_id },
        })
        .then(async (response) => {
          console.log("response.data", response.data);
          this.patients_ = [];
          this.session_packs_ = [];
          if (response.data?.his_ace_patients?.length > 0) {
            const tempPatients = response.data.his_ace_patients;
            let stt = 0;
            // thực hiện gán giá trị cho mảng patient_ và session_pack_
            for (let index = 0; index < tempPatients.length; index++) {
              const tempPatient = {
                stt: ++stt,
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
              };
              if (tempPatients[index].id) {
                tempPatient.id = tempPatients[index].id;
              }
              if (tempPatients[index].fullname) {
                tempPatient.fullname = tempPatients[index].fullname;
              }
              if (tempPatients[index].birthday) {
                tempPatient.birthday = this.filtersStore.DataDateToValDate(
                  tempPatients[index].birthday
                );
              }
              if (tempPatients[index].email) {
                tempPatient.email = tempPatients[index].email;
              }
              if (tempPatients[index].phone_number) {
                tempPatient.phone_number = tempPatients[index].phone_number;
              }
              if (tempPatients[index].company_service_pack_id) {
                tempPatient.pack_id =
                  tempPatients[index].company_service_pack_id;
              }
              if (tempPatients[index].appointment_session_id) {
                tempPatient.session_id =
                  tempPatients[index].appointment_session_id;
              }
              if (tempPatients[index].appointment_session?.name) {
                tempPatient.session_name =
                  tempPatients[index].appointment_session.name;
              }
              if (
                tempPatients[index].appointment_session?.appointment_schedule
                  ?.date
              ) {
                tempPatient.date =
                  tempPatients[
                    index
                  ].appointment_session.appointment_schedule.date;
              }
              if (tempPatient.session_name && tempPatient.date) {
                tempPatient.appointment = `${this.filtersStore.DataDateToValDate(
                  tempPatient.date
                )} - buổi ${tempPatient.session_name}`;
              }
              this.patients_.push(tempPatient);
            }
            console.log("this.patients_", this.patients_);
          }
        })
        .catch((e) => {
          console.log("không có data", e);
        });
      await axios
        .get(`${useRuntimeConfig().public.DOMAIN}/select-session-packs`)
        .then((response) => {
          if (response.data?.length > 0) {
            console.log("response.data", response.data);
            for (let index = 0; index < response.data.length; index++) {
              const tempSessionPack = {
                pack_id: null,
                session_id: null,
                session_name: null,
                date: null,
                session_slots: 0,
                registered_patients: 0,
                session_pack_slots: 0,
              };
              if (response.data[index].pack_id) {
                tempSessionPack.pack_id = response.data[index].pack_id;
              }
              if (response.data[index].session_id) {
                tempSessionPack.session_id = response.data[index].session_id;
              }
              if (response.data[index].session_name) {
                tempSessionPack.session_name =
                  response.data[index].session_name;
              }
              if (response.data[index].date) {
                tempSessionPack.date = this.filtersStore.DataDateToValDate(
                  response.data[index].date
                );
              }
              if (response.data[index].session_slots) {
                tempSessionPack.session_slots =
                  response.data[index].session_slots;
              }
              if (response.data[index].session_pack_slots) {
                tempSessionPack.session_pack_slots =
                  response.data[index].session_pack_slots;
              }
              this.session_packs_.push(tempSessionPack);
            }
            console.log("this.session_packs_", this.session_packs_);
          }
        });
      this.circle_loader.state = false;
      this.circle_loader.icon = "";
    },
    isDisable() {
      if (this.store.state.isLogin) {
        this.display_style = "block";
      } else {
        this.display_style = "none";
      }
      return `display: ${this.display_style};`;
    },

    addPatient() {
      this.formTitle = "Thêm";
      this.dialog = true;
    },

    async editItem(item) {
      this.formTitle = "Sửa";
      this.circle_loader.state = true;
      this.editedIndex = this.patients_.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.edited_session_packs_ = [];
      for (let index = 0; index < this.session_packs_.length; index++) {
        if (this.editedItem.pack_id === this.session_packs_[index].pack_id) {
          this.edited_session_packs_.push(this.session_packs_[index]);
        }
      }
      if (this.edited_session_packs_.length > 0) {
        for (
          let index = 0;
          index < this.edited_session_packs_.length;
          index++
        ) {
          if (
            this.edited_session_packs_[index].pack_id &&
            this.edited_session_packs_[index].session_id
          )
            await axios
              .get(
                `${
                  useRuntimeConfig().public.DOMAIN
                }/get-patient-appointment-total`,
                {
                  params: {
                    pack_id: this.edited_session_packs_[index].pack_id,
                    session_id: this.edited_session_packs_[index].session_id,
                  },
                }
              )
              .then((response) => {
                console.log("response?.data", response?.data);
                this.edited_session_packs_[index].registered_patients =
                  response?.data;
              })
              .catch((e) => {
                console.log("error fetching count patient pack", e);
              });
        }
      }
      console.log(this.edited_session_packs_);

      this.circle_loader.state = false;
      this.dialog = true;
    },

    close() {
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

    async deleteItemConfirm() {
      this.single_circle_loader.icon = "mdi-content-save-settings";
      this.single_circle_loader.title = "Đang thực hiện...";
      this.single_circle_loader.state = true;
      console.log("delete patient...", this.editedItem);
      await axios
        .post(`${useRuntimeConfig().public.DOMAIN}/delete-patients`, {
          patient_id: this.editedItem.id,
        })
        .then((response) => {
          if (response?.data) {
            console.log("delete thành công", response.data);
            this.store.state.snackbar = this.store.state.snackbar_default;
            this.store.state.snackbar.text = "Xóa bệnh nhân thành công!";
            this.store.state.snackbar.timeout = 3500;
            this.store.state.snackbar.state = true;
            this.dialogDelete = false;

            // đóng circle load
            this.single_circle_loader.state = false;
            this.single_circle_loader.icon = "";
            this.single_circle_loader.title = "";
            this.fetchFirstData();
          }
        })
        .catch((e) => {
          this.store.state.snackbar = this.store.state.snackbar_default;
          this.store.state.snackbar.text = "Xóa không thành công!";
          this.store.state.snackbar.timeout = 3500;
          this.store.state.snackbar.state = true;
          this.dialogDelete = false;

          // đóng circle load
          this.single_circle_loader.state = false;
          this.single_circle_loader.icon = "";
          this.single_circle_loader.title = "";
          console.log("Xóa không thành công", e);
        });
    },

    async save() {
      console.log("save: set object", this.editedIndex);
      // kiểm tra field nhập
      if (!this.editedItem.fullname) {
        this.store.state.snackbar.text = "Tên bệnh nhân không được để trống!";
        this.store.state.snackbar.state = true;
      } else if (!this.editedItem.phone_number) {
        this.store.state.snackbar.text =
          "Số điện thoại bệnh nhân không được để trống!";
        this.store.state.snackbar.state = true;
      } else if (!this.editedItem.birthday) {
        this.store.state.snackbar.text =
          "Ngày sinh bệnh nhân không được để trống!";
        this.store.state.snackbar.state = true;
      } else if (!this.editedItem.email) {
        this.store.state.snackbar.text = "Email bệnh nhân không được để trống!";
        this.store.state.snackbar.state = true;
      } else {
        this.single_circle_loader.icon = "mdi-content-save-settings";
        this.single_circle_loader.title = "Đang cập nhật...";
        this.single_circle_loader.state = true;
        // Cập nhật thông tin công ty
        if (this.editedIndex > -1) {
          console.log("save: update object");
          const Patient = {
            id: null,
            email: null,
            fullname: null,
            phone_number: null,
            birthday: null,
            pack_id: null,
            session_id: null,
          };
          if (this.editedItem.id) {
            Patient.id = this.editedItem.id;
          }
          if (this.editedItem.email) {
            Patient.email = this.editedItem.email;
          }
          if (this.editedItem.fullname) {
            Patient.fullname = this.editedItem.fullname;
          }
          if (this.editedItem.birthday) {
            Patient.birthday = this.filtersStore.ValDateToDataDate(
              this.editedItem.birthday
            );
          }
          if (this.editedItem.phone_number) {
            Patient.phone_number = this.editedItem.phone_number;
          }
          if (this.editedItem.pack_id) {
            Patient.pack_id = this.editedItem.pack_id;
          }
          if (this.editedItem.session_id) {
            Patient.session_id = this.editedItem.session_id;
          }
          await axios
            .get(`${useRuntimeConfig().public.DOMAIN}/update-patients`, {
              params: {
                patient: Patient,
              },
            })
            .then(async (response) => {
              if (response?.data) {
                if (response?.data?.update_his_ace_patients?.returning[0]?.id) {
                  console.log("update bệnh nhân thành công", response.data);

                  this.store.state.snackbar = this.store.state.snackbar_default;
                  this.store.state.snackbar.text =
                    "Cập nhật bệnh nhân thành công!";
                  this.store.state.snackbar.timeout = 3500;
                  this.store.state.snackbar.state = true;
                } else {
                  this.store.state.snackbar = this.store.state.snackbar_default;
                  this.store.state.snackbar.text = "Cập nhật không thành công!";
                  this.store.state.snackbar.timeout = 3500;
                  this.store.state.snackbar.state = true;
                  console.log("không có id patient update");
                }
                Object.assign(
                  this.patients_[this.editedIndex],
                  this.editedItem
                );
                this.dialog = false;
                this.single_circle_loader.state = false;
                this.single_circle_loader.icon = "";
                this.single_circle_loader.title = "";
                await this.fetchFirstData();
              }
            })
            .catch((e) => {
              console.log("không có data", e);
            });
        }
        // Thêm công ty
        // else if (this.editedIndex === -1) {
        //   const Patient = {
        //     email: this.editedItem.email,
        //     fullname: this.editedItem.fullname,
        //     phone_number: this.editedItem.phone_number,
        //     website: this.editedItem.website,
        //     company_service_pack_id: this.editedItem.pack_id,
        //     appointment_session_id: this.editedItem.session_id,
        //   };
        //   await axios
        //     .get(`${useRuntimeConfig().public.DOMAIN}/insert-patients`, {
        //       params: {
        //         patient: Patient,
        //       },
        //     })
        //     .then(async (response) => {
        //       if (response?.data) {
        //         console.log("insert thành công", response.data);
        //         this.patients_.push(this.editedItem);
        //         this.patients_[this.patients_.length - 1].stt =
        //           this.patients_.length;
        //         if (response?.data?.insert_his_ace_patients?.returning[0]?.id) {
        //           await this.uploadImage(
        //             response?.data?.insert_his_ace_patients?.returning[0]?.id
        //           );
        //         } else {
        //           console.log("không có id company insert");
        //         }

        //         await this.fetchFirstData();
        //       }
        //     })
        //     .catch((e) => {
        //       console.log("không có data", e);
        //     });
        // }
        this.single_circle_loader.state = false;
        this.single_circle_loader.icon = "";
        this.single_circle_loader.title = "";
        this.dialog = false;
      }
    },
  },
};
</script>

<style scoped>
.col-style {
  margin-top: -35px;
}
.v-progress-circular {
  margin: 1rem;
}
</style>