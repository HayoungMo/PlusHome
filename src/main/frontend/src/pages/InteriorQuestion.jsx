import React, { useState } from 'react';
import SelectMui from '../components/SelectMui';
import RadioMui from '../components/RadioMui';

const InteriorQuestion = () => {
        const [form, setForm] = useState({
            type: ""
        });

        const options = [
        { value: "apt", title: "아파트" },
        { value: "house", title: "주택" },
        { value: "office", title: "오피스" },
         {value: "villar", title: "빌라" }
        ];

        const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: value,
        });
};


    return (
      <div>
        <div>
          주택 종류
          <RadioMui
            label="유형 선택"
            name="type"
            value={form.type}
            onChange={handleChange}
            labelList={options}
            width="100%"
          />
        </div>

        <div>
          평수
          <SelectMui
            label="유형 선택"
            name="type"
            value={form.type}
            onChange={handleChange}
            option={options}
            width="100%"
          />
        </div>

        <div>
          집 상태
          <SelectMui
            label="유형 선택"
            name="type"
            value={form.type}
            onChange={handleChange}
            option={options}
            width="100%"
          />
        </div>

        <div>
          인테리어 이유
          <SelectMui
            label="유형 선택"
            name="type"
            value={form.type}
            onChange={handleChange}
            option={options}
            width="100%"
          />
        </div>

        <div>
          필요한 공간
          <SelectMui
            label="유형 선택"
            name="type"
            value={form.type}
            onChange={handleChange}
            option={options}
            width="100%"
          />
        </div>

        <div>
          예산
          <SelectMui
            label="유형 선택"
            name="type"
            value={form.type}
            onChange={handleChange}
            option={options}
            width="100%"
          />
        </div>

        <div>
          희망 시작일
          <SelectMui
            label="유형 선택"
            name="type"
            value={form.type}
            onChange={handleChange}
            option={options}
            width="100%"
          />
        </div>
      </div>
    );
};

export default InteriorQuestion;