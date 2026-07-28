const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// 解析JSON请求体
app.use(express.json());
app.use(express.static('public'));

// 读取数据库
function readDB() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([]));
        return [];
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    try {
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
}

// 写入数据库
function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// API: 获取所有条目
app.get('/api/entries', (req, res) => {
    const entries = readDB();
    res.json(entries);
});

// API: 添加条目
app.post('/api/entries', (req, res) => {
    const entries = readDB();
    const newEntry = {
        id: uuidv4(),
        author: req.body.author || '',
        book: req.body.book || '',
        text: req.body.text || '',
        riverSection: req.body.riverSection || '',
        theme: req.body.theme || '',
        year: req.body.year || '',
        note: req.body.note || '',
        createdAt: new Date().toISOString()
    };
    entries.push(newEntry);
    writeDB(entries);
    res.status(201).json(newEntry);
});

// API: 更新条目
app.put('/api/entries/:id', (req, res) => {
    const entries = readDB();
    const index = entries.findIndex(e => e.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: '条目不存在' });
    const updated = { ...entries[index], ...req.body, id: entries[index].id, createdAt: entries[index].createdAt };
    entries[index] = updated;
    writeDB(entries);
    res.json(updated);
});

// API: 删除条目
app.delete('/api/entries/:id', (req, res) => {
    let entries = readDB();
    const index = entries.findIndex(e => e.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: '条目不存在' });
    entries.splice(index, 1);
    writeDB(entries);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log('长江游记资料库运行在 http://localhost:' + PORT);
});