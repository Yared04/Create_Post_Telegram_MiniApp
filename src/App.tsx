import { PlusOutlined, SendOutlined, SyncOutlined } from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Switch,
  Upload,
  message,
} from 'antd';
import { useState } from 'react';
import moment from 'moment-timezone'; // Import moment-timezone

const { TextArea } = Input;
const { RangePicker } = DatePicker;

function App() {
  const [form] = Form.useForm();
  const [isCalendarEnabled, setIsCalendarEnabled] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);


  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();
    const fields = form.getFieldsValue();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key]);
    });
    formData.append('client_id', 'client_1')

    // Handle date conversion for calendar
    if (fields.date && fields.date.length === 2) {
      const startTimeUtc = moment(fields.date[0]).tz(moment.tz.guess()).format(); //
      const endTimeUtc = moment(fields.date[1]).tz(moment.tz.guess()).format(); //

      formData.append('start_date', startTimeUtc);
      formData.append('end_date', endTimeUtc);
    }

    const fileList = form.getFieldValue('upload');
    if (fileList) {
      fileList.forEach((file: any) => {
        formData.append('files', file.originFileObj);
      });
    }

    // Send formData to your Telegram bot
    try {
      await fetch('http://localhost:5000/post_event', {
        method: "POST",
        body: formData,
      })

      form.resetFields();
      setTimeout(() => {
        messageApi.open({
          type: "success",
          content: "Post created successfully",
        });
        setLoading(false);
      }, 0);
    } catch (error) {
      {
        console.error('Error:', error);
        setTimeout(() => {
          messageApi.open({
            type: "error",
            content: "Error creating post. Please try again.",
          });
          setLoading(false);
        }, 0);
      }
    };
  }

  const onSwitch = (checked: boolean) => {
    setIsCalendarEnabled(checked);
  };

  return (
    <>
      {contextHolder}
      <div className='flex flex-col items-center justify-center max-w-lg mx-auto p-6'>
        <h2 className='text-xl font-semibold'>Create Post</h2>
        <Form
          layout="vertical"
          style={{ width: '100%' }}
          onFinish={handleSubmit}
          form={form}
        >
          <Form.Item label="Title" name="title">
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item label="Images" name="upload" valuePropName="fileList" getValueFromEvent={normFile}>
            <Upload action={''} listType="picture-card" multiple={false} maxCount={1}>
              <button
                className='text-inherit cursor-pointer border-0 bg-none'
                type="button"
              >
                <PlusOutlined />
                <div className='mt-1'>Upload</div>
              </button>
            </Upload>
          </Form.Item>
          <Form.Item className='place-self-start' layout='horizontal' label="Add to Calendar" name="calendarButton" valuePropName="checked">
            <Switch defaultChecked={isCalendarEnabled} onChange={onSwitch} />
          </Form.Item>
          {isCalendarEnabled === true && (
            <>
              <Form.Item label="Date and Time" name="date">
                <RangePicker showTime format="HH:mm" />
              </Form.Item>
              <Form.Item label="Location" name="location">
                <Input placeholder="Paste a Google Maps link (e.g., https://goo.gl/maps/...)" />
              </Form.Item>
            </>)
          }
          <Form.Item label={null}>
            <Button
              icon={<SendOutlined />}
              iconPosition='end'
              size='large'
              className='!min-w-32'
              type='primary'
              htmlType="submit"
              loading={loading && { icon: <SyncOutlined className='!mb-2' spin /> }}>
              Create Post
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  )
}

export default App
