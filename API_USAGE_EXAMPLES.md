# Stripe API 使用示例
## DAO Essence Shop

### 📡 可用的 API 端点

---

### 1. 健康检查

**端点:** `GET /api/health`

**说明:** 检查服务器是否正常运行

**示例:**
```bash
curl http://localhost:3001/api/health
```

**响应:**
```json
{
  "status": "ok",
  "message": "Stripe server is running"
}
```

---

### 2. 创建 Payment Intent

**端点:** `POST /api/create-payment-intent`

**说明:** 创建支付意图，用于初始化支付流程

**请求体:**
```json
{
  "amount": 99.99,
  "currency": "usd",
  "metadata": {
    "orderId": "order_12345",
    "items": "prod001:DAO Essence:2:49.99|prod002:Incense:1:25.00",
    "shipping": "123 Main St|San Francisco|CA|94102|US",
    "customerName": "John Doe",
    "customerPhone": "+1234567890"
  }
}
```

**示例:**
```bash
curl -X POST http://localhost:3001/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 99.99,
    "currency": "usd",
    "metadata": {
      "orderId": "order_12345",
      "items": "prod001:DAO Essence:2:49.99",
      "shipping": "123 Main St|San Francisco|CA|94102|US"
    }
  }'
```

**响应:**
```json
{
  "success": true,
  "clientSecret": "pi_3Pxxxx_secret_xxxx",
  "paymentIntentId": "pi_3Pxxxx",
  "amount": 9999
}
```

**参数说明:**
- `amount` (必填): 金额（美元）
- `currency` (可选): 货币类型，默认 "usd"
- `metadata.items`: 商品列表，格式 `id:name:quantity:price`，多个商品用 `|` 分隔
- `metadata.shipping`: 配送信息，格式 `address|city|state|zip|country`

---

### 3. 查询 Payment Intent

**端点:** `GET /api/payment-intent/:id`

**说明:** 获取 Payment Intent 的详细信息

**示例:**
```bash
curl http://localhost:3001/api/payment-intent/pi_3Pxxxx
```

**响应:**
```json
{
  "success": true,
  "status": "succeeded",
  "paymentIntent": {
    "id": "pi_3Pxxxx",
    "amount": 9999,
    "currency": "usd",
    "status": "succeeded",
    "created": 1705321800,
    "metadata": {...}
  }
}
```

---

### 4. 查询订单状态

**端点:** `GET /api/order/:orderId`

**说明:** 根据订单 ID 查询订单详情

**示例:**
```bash
curl http://localhost:3001/api/order/order_12345
```

**响应:**
```json
{
  "success": true,
  "order": {
    "orderId": "order_12345",
    "stripePaymentId": "pi_3Pxxxx",
    "amount": 99.99,
    "currency": "USD",
    "status": "paid",
    "paymentStatus": "succeeded",
    "items": [
      {
        "id": "prod001",
        "name": "DAO Essence",
        "quantity": 2,
        "price": 49.99
      }
    ],
    "shipping": {
      "address": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94102",
      "country": "US"
    },
    "customer": {
      "email": "customer@example.com",
      "name": "John Doe",
      "phone": "+1234567890"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 5. 查询订单历史

**端点:** `GET /api/orders`

**说明:** 获取所有订单历史记录（按时间倒序）

**示例:**
```bash
curl http://localhost:3001/api/orders
```

**响应:**
```json
{
  "success": true,
  "orders": [
    {
      "orderId": "order_12345",
      "stripePaymentId": "pi_3Pxxxx",
      "amount": 99.99,
      "currency": "USD",
      "status": "paid",
      "items": [...],
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "orderId": "order_12344",
      "stripePaymentId": "pi_3Pyyyy",
      "amount": 49.99,
      "currency": "USD",
      "status": "failed",
      "error": "Card declined",
      "createdAt": "2024-01-15T09:15:00.000Z"
    }
  ],
  "count": 2
}
```

---

### 6. Webhook 端点

**端点:** `POST /api/webhook`

**说明:** Stripe 用于推送支付事件的端点

**自动触发:** 无需手动调用，Stripe 会在支付状态变化时自动推送

**支持的事件类型:**
- `payment_intent.succeeded` - 支付成功
- `payment_intent.payment_failed` - 支付失败
- `payment_intent.created` - 支付意图创建
- `payment_intent.canceled` - 支付取消
- `checkout.session.completed` - 结账会话完成

---

## 🔧 前端集成示例

### JavaScript (使用 fetch)

```javascript
// 1. 创建 Payment Intent
async function createPaymentIntent(amount, items, shipping) {
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount,
      currency: 'usd',
      metadata: {
        orderId: 'order_' + Date.now(),
        items: items.map(i => `${i.id}:${i.name}:${i.quantity}:${i.price}`).join('|'),
        shipping: `${shipping.address}|${shipping.city}|${shipping.state}|${shipping.zip}|${shipping.country}`,
        customerName: shipping.name,
        customerPhone: shipping.phone
      }
    })
  });

  const data = await response.json();
  return data.clientSecret;
}

// 2. 使用 Stripe Elements 完成支付
async function confirmPayment(clientSecret) {
  const stripe = Stripe('pk_test_xxxx');
  const { error, paymentIntent } = await stripe.confirmCardPayment(
    clientSecret,
    {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: 'John Doe'
        }
      }
    }
  );

  if (error) {
    console.error('Payment failed:', error);
  } else {
    console.log('Payment succeeded:', paymentIntent);
    // Webhook 会在后台处理订单
  }
}

// 3. 查询订单状态
async function getOrderStatus(orderId) {
  const response = await fetch(`/api/order/${orderId}`);
  const data = await response.json();
  return data.order;
}
```

### Vue.js 示例

```javascript
export default {
  methods: {
    async createPayment() {
      const clientSecret = await this.createPaymentIntent(
        this.cartTotal,
        this.cartItems,
        this.shippingInfo
      );

      const stripe = Stripe('pk_test_xxxx');
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: this.$refs.cardElement,
            billing_details: this.billingDetails
          }
        }
      );

      if (!error) {
        this.$router.push(`/order-confirm/${this.orderId}`);
      }
    }
  }
}
```

### React 示例

```javascript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_xxxx');

function CheckoutPage() {
  const handlePayment = async () => {
    const stripe = await stripePromise;
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 99.99 })
    });

    const { clientSecret } = await response.json();

    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: { name: 'John Doe' }
      }
    });

    if (!error) {
      // Payment successful
    }
  };

  return <button onClick={handlePayment}>Pay Now</button>;
}
```

---

## 📝 Metadata 格式说明

### 商品列表格式
```
id:name:quantity:price|id:name:quantity:price
```

**示例:**
```
prod001:DAO Essence:2:49.99|prod002:Incense Set:1:25.00|prod003:Meditation Cushion:1:35.50
```

**解析结果:**
```javascript
[
  { id: 'prod001', name: 'DAO Essence', quantity: 2, price: 49.99 },
  { id: 'prod002', name: 'Incense Set', quantity: 1, price: 25.00 },
  { id: 'prod003', name: 'Meditation Cushion', quantity: 1, price: 35.50 }
]
```

### 配送信息格式
```
address|city|state|zipCode|country
```

**示例:**
```
123 Main St|San Francisco|CA|94102|US
```

**解析结果:**
```javascript
{
  address: '123 Main St',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94102',
  country: 'US'
}
```

---

## ⚠️ 错误处理

### 常见错误码

| 状态码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | API 密钥无效 |
| 404 | 资源未找到 |
| 500 | 服务器内部错误 |

### 错误响应格式
```json
{
  "success": false,
  "error": "Invalid amount. Must be greater than 0."
}
```

---

## 🧪 测试用例

### 完整支付流程测试
```bash
# 1. 创建 Payment Intent
curl -X POST http://localhost:3001/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 99.99,
    "currency": "usd",
    "metadata": {
      "orderId": "test_order_001",
      "items": "prod001:DAO Essence:1:49.99",
      "shipping": "123 Main St|San Francisco|CA|94102|US"
    }
  }'

# 2. 使用返回的 clientSecret 完成支付（在 Stripe Elements 中）

# 3. 等待 Webhook 触发后，查询订单状态
curl http://localhost:3001/api/order/test_order_001

# 4. 查看所有订单
curl http://localhost:3001/api/orders
```

---

## 📚 相关文档

- [Stripe API 文档](https://stripe.com/docs/api)
- [Stripe Webhook 指南](https://stripe.com/docs/webhooks)
- [Stripe Elements 快速开始](https://stripe.com/docs/stripe-js/elements/quickstart)
- [支付意图 API](https://stripe.com/docs/api/payment_intents)

---

**最后更新：** 2024-03-19
