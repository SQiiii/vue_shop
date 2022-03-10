<template>
  <div class="login_container">
    <!-- 登录组件 -->
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avater-box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 表单区域 -->
      <!-- ref 用于设置引用，通过 ref 的值即可得到form表单的实例对象 -->
      <el-form
        ref="loginFormRef"
        label-width="0px"
        class="login_form"
        :model="loginForm"
        :rules="LoginFormRules"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            prefix-icon="el-icon-user"
            v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            prefix-icon="el-icon-lock"
            v-model="loginForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 登录表单的数据绑定对象
      loginForm: {
        username: "admin",
        password: "123456",
      },
      // 表单的验证规则对象
      LoginFormRules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: "请输入登录名称", trigger: "blur" },
          { min: 3, max: 8, message: "长度在 3 到 8 个字符", trigger: "blur" },
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    // 重置登录表单
    resetLoginForm() {
      // this.$refs 可获取引用对象
      // console.log(this);
      this.$refs.loginFormRef.resetFields();
    },
    login() {
      // 登录预验证
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post("login", this.loginForm);
        // console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error("登录失败");
        }
        this.$message.success("登录成功");
        // 1.将登录成功之后的 token，保存到客户端的 sessionStorage 中
        //  1.1 项目中除外登录意外的其他 API 接口，必须在登录之后才能访问
        //  1.2 token 只应在当前网络打开期间生效，所以将token保存在 sessionStorage 中 res.data.token
        window.sessionStorage.setItem("token", res.data.token);
        // 2.通过编程式导航跳转到后台主页，路由地址是 /home
        this.$router.push("/home");
      });
    },
  },
};
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
  position: relative;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.avater-box {
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>