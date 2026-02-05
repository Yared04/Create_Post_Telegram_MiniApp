import { PlusOutlined, SendOutlined, SyncOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Switch,
  Upload,
  message,
  ConfigProvider,
  theme,
} from "antd";
import { useState, useEffect } from "react";
import moment from "moment-timezone";
import { UploadChangeParam } from "antd/es/upload";
import { useSearchParams } from "react-router-dom";

const { TextArea } = Input;

function App() {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [isCalendarEnabled, setIsCalendarEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  // Theme state
  const [appTheme, setAppTheme] = useState<{
    algorithm: any;
    token: any;
  }>({
    algorithm: theme.defaultAlgorithm,
    token: {},
  });

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();

      const colorScheme = tg.colorScheme;
      const themeParams = tg.themeParams;
      const isDark = colorScheme === "dark";

      // Apply background and text color to body immediately
      document.body.style.backgroundColor =
        themeParams.bg_color || (isDark ? "#000000" : "#ffffff");
      document.body.style.color =
        themeParams.text_color || (isDark ? "#ffffff" : "#000000");

      setAppTheme({
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: themeParams.button_color || "#1677ff",
          colorText: themeParams.text_color,
          // Use secondary_bg_color for inputs/cards if available, otherwise fallback
          colorBgContainer: themeParams.secondary_bg_color || (isDark ? "#1f1f1f" : "#ffffff"),
          colorBgBase: themeParams.bg_color || (isDark ? "#000000" : "#ffffff"),
          colorTextPlaceholder: themeParams.hint_color,
        },
      });
    }
  }, []);

  const files = Form.useWatch("upload", form);
  const clientId = searchParams.get("client_id");

  const normFile = (e: UploadChangeParam) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();
    const fields = form.getFieldsValue();

    // Append non-empty fields
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        // Handle date fields specially - they come as Dayjs objects from Ant Design DatePicker
        if (key === "start_date" || key === "end_date") {
          // Check if it's a moment/dayjs object with toISOString method
          const dateValue = (value as any)?.toISOString
            ? (value as any).toISOString()
            : moment(value).toISOString();
          formData.append(key, dateValue);
        } else if (!Array.isArray(value)) {
          formData.append(key, String(value));
        }
      }
    });

    // Append required client_id
    formData.append("client_id", String(clientId));

    // Get Telegram initData for authentication and append it to formData
    const initData = (window as any).Telegram?.WebApp?.initData || "";
    formData.append("telegram_init_data", initData);

    // Handle file uploads
    const fileList = form.getFieldValue("upload");
    if (fileList && fileList.length) {
      fileList.forEach((file: any) => {
        if (file.originFileObj) {
          formData.append("files", file.originFileObj);
        }
      });
    }
    // Send formData to your Telegram bot
    try {
      const apiUrl =
        (import.meta.env.VITE_API_URL || "http://localhost:2000") +
        "/post_event";

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      // form.resetFields();
      setTimeout(() => {
        messageApi.open({
          type: "success",
          content: "Post created successfully",
        });
        setLoading(false);
      }, 0);
    } catch (error: any) {
      {
        console.error("Error:", error);
        setTimeout(() => {
          messageApi.open({
            type: "error",
            content: String(error),
          });
          setLoading(false);
        }, 0);
      }
    }
  };

  const onSwitch = (checked: boolean) => {
    setIsCalendarEnabled(checked);
  };

  return (
    <ConfigProvider theme={appTheme}>
      {contextHolder}
      <div className="flex flex-col items-center justify-center max-w-lg mx-auto p-6 transition-colors duration-300">
        <h2 className="text-xl font-semibold mb-4" style={{ color: appTheme.token.colorText }}>Create Post</h2>
        <Form
          layout="vertical"
          style={{ width: "100%" }}
          onFinish={handleSubmit}
          form={form}
          initialValues={{ calendarButton: false }}
        >
          <Form.Item
            hasFeedback
            label={<span style={{ color: appTheme.token.colorText }}>Title</span>}
            name="title"
            rules={[
              { max: 100, message: "Title must be less than 100 characters" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: appTheme.token.colorText }}>Description</span>}
            name="description"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Please provide a description for the post",
              },
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            hasFeedback
            label={<span style={{ color: appTheme.token.colorText }}>Images</span>}
            name="upload"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[]}
          >
            <Upload
              action={undefined}
              listType="picture-card"
              maxCount={10}
              multiple={true}
              showUploadList={{ showPreviewIcon: false, extra: null }}
              beforeUpload={() => false}
            >
              {(files === undefined || files?.length < 5) && (
                <button
                  className="text-inherit cursor-pointer border-0 bg-none"
                  type="button"
                  style={{ color: appTheme.token.colorText }}
                >
                  <PlusOutlined />
                  <div className="mt-1">Upload</div>
                </button>
              )}
            </Upload>
          </Form.Item>
          <Form.Item
            className="place-self-start"
            layout="horizontal"
            label={<span style={{ color: appTheme.token.colorText }}>Add to Calendar</span>}
            name="calendarButton"
            valuePropName="checked"
          >
            <Switch defaultChecked={isCalendarEnabled} onChange={onSwitch} />
          </Form.Item>
          {isCalendarEnabled === true && (
            <>
              <Form.Item
                label={<span style={{ color: appTheme.token.colorText }}>Start Date & Time</span>}
                name="start_date"
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please select a start date and time",
                  },
                ]}
              >
                <DatePicker
                  showTime={{ format: "h:mm A", use12Hours: true }}
                  format="YYYY-MM-DD h:mm A"
                  placement="bottomRight"
                  size="large"
                  style={{ width: "100%" }}
                  placeholder="Select start date and time"
                />
              </Form.Item>
              <Form.Item
                label={<span style={{ color: appTheme.token.colorText }}>End Date & Time</span>}
                name="end_date"
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please select an end date and time",
                  },
                ]}
              >
                <DatePicker
                  showTime={{ format: "h:mm A", use12Hours: true }}
                  format="YYYY-MM-DD h:mm A"
                  size="large"
                  placement="bottomRight"
                  style={{ width: "100%" }}
                  placeholder="Select end date and time"
                />
              </Form.Item>
              <Form.Item
                label={<span style={{ color: appTheme.token.colorText }}>Location</span>}
                name="location"
                hasFeedback
                rules={[
                  {
                    pattern: new RegExp(
                      /^(https?:\/\/)?([\w-]+(\.\w-]+)+)(\/[\w-]*)*\/?$/
                    ),
                    message: "Please input a valid link",
                  },
                ]}
              >
                <Input placeholder="Paste a Google Maps link (e.g., https://goo.gl/maps/...)" />
              </Form.Item>
            </>
          )}
          <Form.Item label={null}>
            <Button
              icon={<SendOutlined />}
              iconPosition="end"
              size="large"
              className="!min-w-32"
              type="primary"
              htmlType="submit"
              loading={
                loading && { icon: <SyncOutlined className="!mb-2" spin /> }
              }
            >
              Create Post
            </Button>
          </Form.Item>
        </Form>
      </div>
    </ConfigProvider>
  );
}

export default App;
