import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { changePassword } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }
    changePassword(newPassword);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8" dir="rtl">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="size-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="size-7 text-amber-700" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">تغيير كلمة المرور</h1>
          <p className="text-sm text-muted-foreground">يجب تغيير كلمة المرور عند أول تسجيل دخول</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="6 أحرف على الأقل"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="أعد إدخال كلمة المرور"
              className="h-11"
            />
          </div>
          <Button type="submit" className="w-full h-11">تغيير كلمة المرور</Button>
        </form>
      </div>
    </div>
  );
}
