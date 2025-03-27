import { PlusOutlined, SendOutlined, SyncOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, Switch, Upload, message } from "antd";
import { useState } from "react";
import moment from "moment-timezone";
import { UploadChangeParam } from "antd/es/upload";
import { useSearchParams } from "react-router-dom";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

function App() {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [isCalendarEnabled, setIsCalendarEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

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
        if (Array.isArray(value)) {
          // Handle arrays like date ranges separately
          if (key === "date" && value.length === 2) {
            formData.append("start_date", moment(value[0]).format());
            formData.append("end_date", moment(value[1]).format());
          }
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Append required client_id
    formData.append("client_id", String(clientId));

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
      const response = await fetch(
        "https://bot-backend-xuh1.onrender.com/post_event",
        {
          method: "POST",
          body: formData,
        }
      );
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
    } catch (error) {
      {
        console.error("Error:", error);
        setTimeout(() => {
          messageApi.open({
            type: "error",
            content: "Error creating post. Please try again.",
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
    <>
      {contextHolder}
      <div className="flex flex-col items-center justify-center max-w-lg mx-auto p-6">
        <h2 className="text-xl font-semibold">Create Post</h2>
        <Form
          layout="vertical"
          style={{ width: "100%" }}
          onFinish={handleSubmit}
          form={form}
          initialValues={{ calendarButton: false }}
        >
          <Form.Item
            hasFeedback
            label="Title"
            name="title"
            rules={[
              { max: 100, message: "Title must be less than 100 characters" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
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
            label="Images"
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
            label="Add to Calendar"
            name="calendarButton"
            valuePropName="checked"
          >
            <Switch defaultChecked={isCalendarEnabled} onChange={onSwitch} />
          </Form.Item>
          {isCalendarEnabled === true && (
            <>
              <Form.Item
                label="Date and Time"
                name="date"
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please select a date and time for the event",
                  },
                ]}
              >
                <RangePicker showTime format="HH:mm" />
              </Form.Item>
              <Form.Item
                label="Location"
                name="location"
                hasFeedback
                rules={[
                  {
                    pattern: new RegExp(
                      /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-]*)*\/?$/
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
    </>
  );
}

export default App;
