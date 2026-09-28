import "@sharpdotnut/logo"; // side effect: registers <logo-anim>
import favicon from "@sharpdotnut/logo/Logo_BR.svg?url";
import { createApp } from "vue";
import App from "./App.vue";
import "./styles/tokens.css";
import "./styles/base.css";

const icon = document.createElement("link");
icon.rel = "icon";
icon.href = favicon;
document.head.append(icon);

createApp(App).mount("#app");
