<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            clearable
            v-model="queryInfor.query"
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row)"
            ></el-button>
            <!-- 删除角色按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfor.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfor.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addFrom"
        :rules="addFromRules"
        ref="addFromRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addFrom.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addFrom.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addFrom.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addFrom.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户信息的对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="changeDialogVisible"
      width="50%"
      @close="changeDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="changeForm"
        :rules="changeFormRules"
        ref="changeFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="changeForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="changeForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="changeForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="changeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="changeUser">确定</el-button>
      </span>
    </el-dialog>

    <!-- 删除 -->
  </div>
</template>

<script>
export default {
  created() {
    this.getUserList();
  },
  data() {
    // 自定义校验规则
    // 验证邮箱的校验规则
    var checkEmail = (rule, val, cb) => {
      // 验证邮箱的规则
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])/;
      if (regEmail.test(val)) {
        // 合法的邮箱
        return cb();
      }
      cb(new Error("请输入合法的邮箱"));
    };
    // 验证手机号的校验规则
    var checkMobile = (rule, val, cb) => {
      // 验证手机号的正则
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[0-9]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regMobile.test(val)) {
        // 合法的手机号
        return cb();
      }
      cb(new Error("请输入合法的手机号"));
    };
    return {
      // 获取用户列表的参数对象
      queryInfor: {
        query: "",
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 5,
      },
      userlist: [],
      total: 0,
      // 控制添加用户对话框的显示和隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addFrom: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      // 添加表单的验证规则对象
      addFromRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户名长度在3到10个字符之间",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "用户名长度在6到15个字符之间",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      // 控制修改用户信息对话框的显示和隐藏
      changeDialogVisible: false,
      // 修改用户的表单数据
      changeForm: {},
      // 修改表单的验证规则对象
      changeFormRules: {
        username: [],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfor,
      });
      // console.log(res);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.userlist = res.data.users;
      this.total = res.data.total;
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfor.pagesize = newSize;
      // 重新发起请求
      this.getUserList();
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryInfor.pagenum = newPage;
      this.getUserList();
    },
    // 监听 switch 开关状态的改变
    async userStateChanged(userinfo) {
      console.log(userinfo);
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("更新用户状态失败");
      }
      this.$message.success("更新状态成功");
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      // 为表单添加重置事件
      this.$refs.addFromRef.resetFields();
    },
    // 确定按钮的监听事件，用于添加用户
    addUser() {
      this.$refs.addFromRef.validate(async (valid) => {
        if (!valid) return;
        // 发起添加用户的网络请求
        const { data: res } = await this.$http.post("users", this.addFrom);
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg);
        this.$message.success("添加用户成功");
        this.addDialogVisible = false;
        this.getUserList();
      });
    },
    // 点击修改按钮，获取用户数据
    async showEditDialog(val) {
      this.changeDialogVisible = true;
      const { data: res } = await this.$http.get(`users/${val.id}`);
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.changeForm = res.data;
    },
    // 监听修改表单的关闭事件
    changeDialogClosed() {
      this.$refs.changeFormRef.resetFields();
    },
    // 确定按钮的监听事件，用于修改用户
    changeUser() {
      this.$refs.changeFormRef.validate(async (valid) => {
        // console.log(valid);
        if (!valid) return;
        // 发起修改用户的网络请求
        const { data: res } = await this.$http.put(
          `users/${this.changeForm.id}`,
          {
            email: this.changeForm.email,
            mobile: this.changeForm.mobile,
          }
        );
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
        this.$message.success(res.meta.msg);
        this.changeDialogVisible = false;
        this.getUserList();
      });
    },
    // 根据ID值删除用户信息
    async removeUserById(id) {
      // console.log(id);
      // 弹窗询问用户是否删除数据---- 返回值是 Promise 对象
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      // 若用户确认删除，则打印confirm字符串，反之打印 cancel 字符串
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      // 若确认删除，发起 delete 请求
      const { data: res } = await this.$http.delete(`users/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success("用户删除成功");
      this.getUserList();
      // console.log(confirmResult);
    },
  },
};
</script>

<style>
</style>