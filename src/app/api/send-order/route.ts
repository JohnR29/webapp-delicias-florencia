import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // body: { user_id?: string, order_data: any }
    const { user_id, order_data } = body;
    if (!order_data) {
      return NextResponse.json({ error: 'order_data is required' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('orders')
      .insert([{ user_id: user_id || null, order_data }])
      .select('id')
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ orderId: data.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
