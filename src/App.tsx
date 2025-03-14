import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Switch,
  Upload,
} from 'antd';
const { TextArea } = Input;
const { TimePicker } = DatePicker;

function App() {
  const [form] = Form.useForm();


  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleSubmit = () => {
    console.log('form', form.getFieldsValue());
    form.resetFields()
  }

  return (
    <div className='flex flex-col items-center justify-center max-w-lg mx-auto p-6'>
      <h2 className='text-xl font-semibold'>Create a Post</h2>
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
        <Form.Item label="Upload" name="upload" valuePropName="fileList" getValueFromEvent={normFile}>
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
        <div className='flex justify-between'>
          <Form.Item label="Date" name="date">
            <DatePicker className='mr-2' />
          </Form.Item>
          <Form.Item label="Time" name="time">
            <TimePicker />
          </Form.Item>
        </div>
        <Form.Item className='place-self-start' layout='horizontal' label="Add calendar button" name="calendarButton" valuePropName="checked">
          <Switch />
        </Form.Item>
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
