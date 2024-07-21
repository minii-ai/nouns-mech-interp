import { NextResponse } from 'next/server';

export const GET = async (req) => {
  try {
    console.log(req);
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    console.log(urlParams);
    const features = [
      { x: 70, y: 80, name: "Burger", id: 101 },
      { x: 90, y: 100, name: "Pizza", id: 102 },
      { x: 110, y: 120, name: "Ice Cream", id: 103 },
      { x: 130, y: 140, name: "Fries", id: 104 },
      { x: 150, y: 160, name: "Taco", id: 105 },
      { x: 170, y: 180, name: "Nachos", id: 106 },
      { x: 190, y: 200, name: "Pasta", id: 107 },
      { x: 210, y: 220, name: "Sushi", id: 108 },
      { x: 230, y: 240, name: "Salad", id: 109 },
      { x: 250, y: 260, name: "Sandwich", id: 110 },
      { x: 270, y: 280, name: "Soup", id: 111 },
      { x: 290, y: 300, name: "Steak", id: 112 },
      { x: 310, y: 320, name: "Chicken", id: 113 },
      { x: 330, y: 340, name: "Fish", id: 114 },
      { x: 350, y: 360, name: "Eggs", id: 115 },
      { x: 370, y: 380, name: "Waffles", id: 116 },
      { x: 390, y: 400, name: "Pancakes", id: 117 },
    ];
    // Get feature by id
    if (urlParams.has('id')) {
      const id = parseInt(urlParams.get('id'));
      const feature = [{ x: 70, y: 80, name: "Burger", id: 101, activation: 0.2 }]
      return NextResponse.json({ ok: true, data: feature });
    } 
    // Get all features
    else {
      return NextResponse.json({ ok: true, data: features });
    }

  } catch (error) {
    console.error('Error getting features:', error);
    return NextResponse.json({ status: 500, message: 'Internal Server Error' });
  }
};