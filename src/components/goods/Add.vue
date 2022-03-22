<template>
  <div>
    <!-- 面包屑视图区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert
        title="添加商品信息"
        type="info"
        show-icon
        :closable="false"
        center
      >
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- tab栏区域 -->
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="catesList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox
              ></el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 渲染tab栏右侧内容 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action：表示图片要上传到后台API地址 -->
            <!-- on-preview 表示预览的事件监听方法 -->
            <!-- on-remove 表示上传图片的移除效果 -->
            <!-- list-type 表示上传图片后，在页面中的展示效果 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor
              ref="myQuillEditor"
              v-model="addForm.goods_introduce"
            />
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";
export default {
  created() {
    this.getCateList();
  },
  data() {
    return {
      // 步骤条区域的进度索引值
      activeIndex: "0",
      // 添加商品的数据对象
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品详情描述
        goods_introduce: "",
        attrs: [],
      },
      // 表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" },
        ],
      },
      // 商品分类列表
      catesList: [],
      cateProps: {
        expandTrigger: "hover",
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },
      // 分类动态参数列表
      manyTableData: [],
      // 分类静态参数列表
      onlyTableData: [],
      // 图片上传的后台API地址
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      // 图片的预览地址
      previewPath: "",
      // 图片预览对话框
      previewVisible: false,
    };
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.catesList = res.data;
      // console.log(res.data);
    },
    // 级联选择器选中项发生变化，会触发该函数
    handleChange() {
      // console.log(this.addForm.goods_cat);
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    beforeTabLeave(activeName, oldactiveName) {
      // console.log(activeName, oldactiveName);
      if (this.addForm.goods_cat.length !== 3 && oldactiveName === "0") {
        this.$message.info("请先选择商品分类");
        return false;
      }
    },
    // tab栏点击时触发的事件
    tabClicked() {
      // console.log(this.activeIndex);
      if (this.activeIndex === "1") {
        this.getManyorOnlyTableData("many");
      }
      if (this.activeIndex === "2") {
        this.getManyorOnlyTableData("only");
      }
    },
    // 获取参数/属性列表请求事件
    async getManyorOnlyTableData(par) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: par } }
      );
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      console.log(res.data);

      if (par === "many") {
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(",");
        });
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
      // console.log(res.data);
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      console.log(this.previewPath);
      this.previewVisible = true;
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // 1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path;
      // 2.从pics数组中，找到这个图片对于的索引值
      const i = this.addForm.pics.findIndex((x) => x.pic === filePath);
      // 3.调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
      this.addForm.pics.splice(i, 1);
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      // 1、拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path };
      // 2、将图片信息对象，push到pics数组中
      this.addForm.pics.push(picInfo);
    },
    // 添加商品
    add() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error("请填写必要的表单项！");
        }
        // 执行添加的业务逻辑
        // lodash cloneDeep(obj)，对对象进行深拷贝,若直接对addForm进行操作，会报错，因为会改变goods_cat的类型
        const form = _.cloneDeep(this.addForm);
        form.goods_cat = form.goods_cat.join(",");
        // console.log(form);
        // 处理动态参数和静态属性
        this.manyTableData.forEach((item) => {
          console.log(Array.isArray(item.attr_vals));
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(","),
          };
          this.addForm.attrs.push(newInfo);
          console.log("many");
        });
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          };
          this.addForm.attrs.push(newInfo);
          console.log("only");
        });
        form.attrs = this.addForm.attrs;
        // console.log(form);
        const { data: res } = await this.$http.post("goods", form);
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg);
        }
        this.$message.success(res.meta.msg);
        this.$router.push("/goods");
      });
    },
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },
};
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>