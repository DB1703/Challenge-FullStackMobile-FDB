import { useAuthStore } from '@/features/auth/auth.store';
import { EditProfileForm } from '@/features/profile/components/edit-profile-form';

export default function EditProfileScreen() {
	const user = useAuthStore((state) => state.user);

	// `user` is null only while the session is ending; the protected routes then leave this screen.
	if (!user) {
		return null;
	}

	return <EditProfileForm user={user} />;
}
