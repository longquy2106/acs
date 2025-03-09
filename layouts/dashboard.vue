<template>
  <v-card class="card_style" theme="light">
    <v-app-bar>
      <!-- <template v-slot:prepend>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      </template> -->
      <v-row justify="center" min-width="100vw">
        <v-col cols="auto" style="padding-top: 0">
          <a-menu
            v-model:selectedKeys="layout.app_bar.items"
            mode="horizontal"
            :default-selected-keys="['table_manage']"
            :default-open-keys="['company_packages']"
            class="d-flex align-center justify-center"
          >
            <template v-for="menu in filteredMenu">
              <a-sub-menu
                :key="menu.key"
                v-if="menu.children && menu.children.length"
                style="font-weight: 500"
              >
                <template #title>
                  <span>
                    <a-icon :type="menu.icon" />
                    <span>{{ menu.label }}</span>
                  </span>
                </template>

                <!-- Menu Children -->
                <a-menu-item v-for="item in menu.children" :key="item.key">
                  <NuxtLink :to="`/${menu.key}/${item.key}`">
                    {{ item.label }}
                  </NuxtLink>
                </a-menu-item>
                <!-- <NuxtLink
                    v-for="item in menu.children"
                    :key="item.key"
                    :to="`/${menu.key}/${item.key}`"
                  >
                    <a-menu-item>
                      {{ item.label }}
                    </a-menu-item>
                  </NuxtLink> -->
              </a-sub-menu>

              <!-- Menu Item không có children -->
              <a-menu-item v-else :key="menu.key" style="font-weight: 500">
                <NuxtLink :to="`/${menu.key}`">
                  <a-icon :type="menu.icon" />
                  {{ menu.label }}
                </NuxtLink>
              </a-menu-item>
            </template>
          </a-menu>
          <!-- <v-tabs
              v-model="tab"
              color="light-green-accent-2"
              align-tabs="center"
            >
              <v-tab
                v-for="(item, i) in layout.app_bar.items"
                :key="i"
                :value="item.id"
                @click="getListNavDraw(item), (drawer = true)"
                >{{ item.title }}</v-tab
              >
            </v-tabs> -->
        </v-col>
        <v-col cols="auto">
          <a-tooltip placement="bottomLeft">
            <template #title>
              <span>Log out</span>
            </template>
            <a-button type="text" danger @click="logOut">
              <logout-outlined />
            </a-button>
          </a-tooltip>
        </v-col>
      </v-row>
      <!-- <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn> -->
    </v-app-bar>

    <v-main>
      <v-card theme="light" min-height="calc(100vh - 64px)" class="pa-2">
        <slot />
      </v-card>
    </v-main>
  </v-card>
  <Snackbar />
</template>

<script>
import axios from "axios";
import { useFiltersStore } from "~/store/index.ts";
import { storeToRefs } from "pinia";
import Snackbar from "~/components/utilities/Snackbar.vue";
export default {
  name: "DashboardLayout",

  components: {
    Snackbar,
  },
  data() {
    return {
      menuConfig: [
        {
          key: "manual_sync",
          label: "Đồng bộ",
          icon: "manual_sync",
          roles: ["admin"],
        },
        {
          key: "table_manage",
          label: "Quản lý khám bệnh",
          icon: "dashboard",
          roles: ["admin", "KD", "LH"],
          children: [
            {
              key: "companies",
              label: "Danh sách công ty",
              roles: ["admin", "KD"],
            },
            {
              key: "company_packages",
              label: "Danh sách gói khám",
              roles: ["admin", "KD", "LH"],
            },
            {
              key: "patients",
              label: "Danh sách bệnh nhân",
              roles: ["admin", "KD"],
            },
          ],
        },
        {
          key: "schedule_manage",
          label: "Quản lý lịch khám",
          icon: "dashboard",
          roles: ["admin", "LH"],
          children: [
            {
              key: "examination_schedule",
              label: "Danh sách lịch hẹn",
              roles: ["admin", "LH"],
            },
            {
              key: "real_examination",
              label: "Số lượng khám trực",
              roles: ["admin", "LH"],
            },
          ],
        },
        {
          key: "reports/appointment_report",
          label: "Báo cáo",
          icon: "dashboard",
          roles: ["admin", "LH"],
        },
      ],

      store: storeToRefs(useFiltersStore()),
      filtersStore: useFiltersStore(),
      items: [
        { text: "Real-Time", icon: "mdi-clock" },
        { text: "Audience", icon: "mdi-account" },
        { text: "Conversions", icon: "mdi-flag" },
      ],
      layout: {
        app_bar: {
          items: [
            {
              id: 1,
              icon: null,
              title: "Trang chủ",
              permission: ["admin", "LH", "KD", "KH"],
            },
            {
              id: 2,
              icon: null,
              title: "Quản lý khám bệnh",
              permission: ["admin", "LH", "KD", "KH"],
            },
            {
              id: 3,
              icon: null,
              title: "Quản lý lịch khám",
              permission: ["admin", "LH"],
            },
            {
              id: 4,
              icon: null,
              title: "Báo cáo",
              permission: ["admin", "LH", "KD"],
            },
          ],
        },
        nav_draw: {
          items: [
            {
              id: 1,
              icon: "mdi-view-dashboard",
              title: "Dashboard",
              path: "/",
              app_bar_id: 1,
            },
            {
              id: "dongbo_pd",
              icon: "mdi-sync-circle",
              title: "Đồng bộ thủ công",
              path: "/manual_sync",
              app_bar_id: 1,
              permission: ["admin"],
            },
            {
              id: 2,
              icon: "mdi-domain",
              title: "Danh sách công ty",
              path: "/table_manage/companies",
              app_bar_id: 2,
              permission: ["admin", "KH", "KD"],
            },
            {
              id: 3,
              icon: "mdi-medical-bag",
              title: "Danh sách gói khám",
              path: "/table_manage/company_packages",
              app_bar_id: 2,
            },
            {
              id: 4,
              icon: "mdi-account-box",
              title: "Danh sách bệnh nhân",
              path: "/table_manage/patients",
              app_bar_id: 2,
              permission: ["admin", "KH", "KD"],
            },
            {
              id: 5,
              icon: "mdi-calendar-today",
              title: "Danh sách lịch hẹn",
              path: "/schedule_manage/examination_schedule",
              app_bar_id: 3,
              permission: ["admin", "LH"],
            },
            {
              id: 6,
              icon: "mdi-clipboard-clock-outline",
              title: "Số lượng khám thực",
              path: "/table_manage/real_examination",
              app_bar_id: 3,
              permission: ["admin", "LH"],
            },
            {
              id: 7,
              icon: "mdi-file-export",
              title: "Báo cáo theo ngày",
              path: "/reports/appointment_report",
              app_bar_id: 4,
              permission: ["admin", "LH", "KD"],
            },
          ],
        },
        nav_draw_now: {
          items: [
            {
              id: 1,
              icon: "mdi-view-dashboard",
              title: "Dashboard",
              path: "/",
            },
          ],
        },
      },
      overlay: true,
      text: "dashboard",
      tab: null,
      drawer: true,
    };
  },

  async mounted() {
    await this.fetchLogin();
    await this.filtersStore.fetchUser();
    this.fetListAppBar();
    this.getListNavDraw({
      id: 1,
      icon: null,
      title: "Trang chủ",
      permission: ["admin", "LH", "KD", "KH"],
    });
  },
  computed: {
    filteredMenu() {
      const filterMenuByRole = (menu) => {
        if (
          !menu.roles ||
          menu.roles.includes(this.store.data.user.permission)
        ) {
          const filteredChildren = menu.children
            ? menu.children.filter(
                (child) =>
                  !child.roles ||
                  child.roles.includes(this.store.data.user.permission)
              )
            : [];
          return { ...menu, children: filteredChildren };
        }
        return null;
      };

      return this.menuConfig
        .map(filterMenuByRole)
        .filter((menu) => menu !== null);
    },
  },
  methods: {
    async fetchLogin() {
      this.overlay = true;
      await this.filtersStore.fetchLogin();
      this.overlay = false;
    },
    testLogin() {
      return this.store.state.isLogin;
    },
    fetListAppBar() {
      this.layout.app_bar.items = this.layout.app_bar.items.filter((item) => {
        for (const i of item.permission) {
          if (this.store.data.user.permission === i) {
            return true;
          }
        }
        return false;
      });
      console.log("this.app_bar.items", this.layout.app_bar.items);
    },
    getListNavDraw(item) {
      this.layout.nav_draw_now.items = [];
      for (let i = 0; i < this.layout.nav_draw.items.length; i++) {
        if (item.id === this.layout.nav_draw.items[i].app_bar_id) {
          const tempItem = {
            id: this.layout.nav_draw.items[i].id,
            icon: this.layout.nav_draw.items[i].icon,
            title: this.layout.nav_draw.items[i].title,
            path: this.layout.nav_draw.items[i].path,
          };
          if (
            this.layout.nav_draw.items[i]?.permission &&
            this.layout.nav_draw.items[i].permission.length > 0
          ) {
            for (
              let j = 0;
              j < this.layout.nav_draw.items[i].permission.length;
              j++
            ) {
              if (
                this.layout.nav_draw.items[i].permission[j] ===
                this.store.data.user.permission
              ) {
                this.layout.nav_draw_now.items.push(tempItem);
              }
            }
          } else {
            this.layout.nav_draw_now.items.push(tempItem);
          }
        }
      }
      console.log(this.layout.nav_draw_now);
    },

    logOut() {
      localStorage.removeItem("loginToken");
      this.store.state.isLogin = false;
      this.$router.push({ path: "/login" });
    },
  },
};
</script>

<style scoped>
/* .app-bar {
  background-color: rgba(0, 0, 0, 0.3);
  box-shadow: 5px 10px rgba(59, 202, 59, 0) !important;
} */
.app-bar-title {
  font-weight: bold;
  vertical-align: middle;
}
.app-bar-item {
  color: rgb(0, 0, 0);
  font-family: "Times New Roman", Times, serif;
}
.app-bar-icon {
  display: block;
}
.card_style {
  display: flex;
  border-radius: 0;
  min-height: 100vh;
  /* margin-bottom: 3vw; */
}
.link_style {
  color: #fff;
  text-decoration: none;
}
.nav_btn_style {
  background: #ffffff00;
  margin: 0;
  text-align: left;
}
/* @media only screen and (max-width: 576px) {
  .app-bar-item {
    display: none;
  }
  .app-bar-icon {
    display: block;
  }
}
@media only screen and (min-width: 576px) {

  .app-bar-icon {
    display: none;
  }
}
@media only screen and (min-width: 768px) {
  .app-bar-icon {
    display: none;
  }
  .card {
  }
}
@media only screen and (min-width: 992px) {
  .app-bar-icon {
    display: none;
  }
  .card {
  }
}
@media only screen and (min-width: 1200px) {
}
@media only screen and (min-width: 1400px) {
} */
</style>