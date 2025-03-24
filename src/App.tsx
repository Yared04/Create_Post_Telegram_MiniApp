import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Switch,
  Upload,
} from 'antd';
import { useState } from 'react';
const { TextArea } = Input;
const { RangePicker } = DatePicker;

function App() {
  const [form] = Form.useForm();
  const [isCalendarEnabled, setIsCalendarEnabled] = useState(false);


  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleSubmit = () => {
    const formData = new FormData();
    const fields = form.getFieldsValue();
    Object.keys(fields).forEach(key => {
      formData.append(key, fields[key]);
    });


    const fileList = form.getFieldValue('upload');
    if (fileList) {
      fileList.forEach((file: any) => {
        formData.append('files', file.originFileObj);
      });
    }

    // Send formData to your Telegram bot
    fetch('http://localhost:5000/post_event', {
      method: "POST",
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        form.resetFields();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const onSwitch = (checked: boolean) => {
    setIsCalendarEnabled(checked);
  };

  return (
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
        {/* <Form.Item label="Select" name="select">
          <Select>
            <Select.Option value="demo">Demo</Select.Option>
          </Select>
        </Form.Item> */}
        <Form.Item label="Description" name="description">
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item label="Images" name="upload" valuePropName="fileList" getValueFromEvent={normFile}>
          <Upload listType="picture-card" multiple={true}>
            <button
              style={{ color: 'inherit', cursor: 'inherit', border: 0, background: 'none' }}
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
          <Button size='large' className='' type='primary' htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default App
